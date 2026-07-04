# app/core/deps.py
"""FastAPI dependency injection — auth guards and DB session."""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ActorType, HRRole
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.employee import Employee
from app.models.hr_officer import HROfficer

security_scheme = HTTPBearer()

# Type alias for dependency injection
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_actor(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    db: DbSession,
) -> tuple[HROfficer | Employee, str]:
    """Decode JWT, load the actor row, return (actor, actor_type).

    Raises 401 if token is invalid/missing or actor is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(credentials.credentials)
        sub: str | None = payload.get("sub")
        actor_type: str | None = payload.get("actor_type")
        if sub is None or actor_type is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    actor_id = uuid.UUID(sub)

    if actor_type == ActorType.HR_OFFICER:
        result = await db.execute(
            select(HROfficer).where(HROfficer.id == actor_id)
        )
        actor = result.scalar_one_or_none()
    elif actor_type == ActorType.EMPLOYEE:
        result = await db.execute(
            select(Employee).where(Employee.id == actor_id)
        )
        actor = result.scalar_one_or_none()
    else:
        raise credentials_exception

    if actor is None or not actor.is_active:
        raise credentials_exception

    return actor, actor_type


# Convenience type
CurrentActor = Annotated[tuple[HROfficer | Employee, str], Depends(get_current_actor)]


async def require_hr_or_admin(
    actor_info: CurrentActor,
) -> HROfficer:
    """403 unless the caller is an hr_officer (admin or hr)."""
    actor, actor_type = actor_info
    if actor_type != ActorType.HR_OFFICER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR officer access required",
        )
    return actor  # type: ignore[return-value]


async def require_admin(
    actor_info: CurrentActor,
) -> HROfficer:
    """403 unless the caller is an hr_officer with role='admin'."""
    actor, actor_type = actor_info
    if actor_type != ActorType.HR_OFFICER or actor.role != HRRole.ADMIN:  # type: ignore[union-attr]
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return actor  # type: ignore[return-value]


async def require_employee(
    actor_info: CurrentActor,
) -> Employee:
    """403 if actor_type != 'employee'."""
    actor, actor_type = actor_info
    if actor_type != ActorType.EMPLOYEE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required",
        )
    return actor  # type: ignore[return-value]


def check_self_or_hr(
    actor: HROfficer | Employee,
    actor_type: str,
    employee_id: uuid.UUID,
) -> None:
    """Inline helper: 403 if the actor is an employee but not the target employee."""
    if actor_type == ActorType.EMPLOYEE and actor.id != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own data",
        )
