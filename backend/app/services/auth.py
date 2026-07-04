# app/services/auth.py
"""Authentication service — signup, login, change-password logic."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ActorType
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.company import Company
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MeResponse,
    SignupRequest,
    TokenResponse,
)


async def signup(db: AsyncSession, data: SignupRequest) -> TokenResponse:
    """Create/update company settings and create an HR officer.

    Creates the first HR officer if needed.
    """
    # Check if email already exists
    existing = await db.execute(
        select(HROfficer).where(HROfficer.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An HR officer with this email already exists",
        )

    # Create a new company
    login_prefix = data.company_name[:2].upper().ljust(2, "X")
    company = Company(
        company_name=data.company_name,
        login_prefix=login_prefix,
        logo_url=data.logo_url,
    )
    db.add(company)
    await db.flush()  # To get company.id

    officer = HROfficer(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        company_id=company.id,
        email_verified=True,
    )
    db.add(officer)
    await db.flush()

    token = create_access_token(
        sub=str(officer.id),
        actor_type=ActorType.HR_OFFICER,
    )
    return TokenResponse(
        access_token=token,
        actor_type=ActorType.HR_OFFICER,
        must_reset_password=False,
    )


async def login(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    """Authenticate by email or employee_code (login_id)."""
    # Try HR officer by email first
    result = await db.execute(
        select(HROfficer).where(HROfficer.email == data.identifier)
    )
    officer = result.scalar_one_or_none()
    if officer:
        if not officer.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
        if not verify_password(data.password, officer.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        token = create_access_token(
            sub=str(officer.id),
            actor_type=ActorType.HR_OFFICER,
        )
        return TokenResponse(
            access_token=token,
            actor_type=ActorType.HR_OFFICER,
            must_reset_password=False,
        )

    # Try employee by email or employee_code
    result = await db.execute(
        select(Employee).where(
            (Employee.email == data.identifier)
            | (Employee.employee_code == data.identifier)
        )
    )
    employee = result.scalar_one_or_none()
    if employee:
        if not employee.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
        if not verify_password(data.password, employee.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        token = create_access_token(
            sub=str(employee.id),
            actor_type=ActorType.EMPLOYEE,
        )
        return TokenResponse(
            access_token=token,
            actor_type=ActorType.EMPLOYEE,
            must_reset_password=getattr(employee, "must_reset_password", False),
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )


async def change_password(
    db: AsyncSession,
    actor: HROfficer | Employee,
    actor_type: str,
    data: ChangePasswordRequest,
) -> dict:
    """Change password for the current actor."""
    if not verify_password(data.current_password, actor.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    actor.password_hash = hash_password(data.new_password)

    # Clear the must_reset_password flag for employees
    if actor_type == ActorType.EMPLOYEE and hasattr(actor, "must_reset_password"):
        actor.must_reset_password = False

    await db.flush()
    return {"detail": "Password changed successfully"}


async def get_me(
    actor: HROfficer | Employee,
    actor_type: str,
) -> MeResponse:
    """Return the current actor's basic info."""
    return MeResponse(
        id=actor.id,
        full_name=actor.full_name,
        email=actor.email,
        actor_type=actor_type,
    )
