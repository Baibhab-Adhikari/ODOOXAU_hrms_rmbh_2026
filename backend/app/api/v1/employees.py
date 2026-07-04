# app/api/v1/employees.py
"""Employee management routes."""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    ActorType,
    DEFAULT_PAID_TIME_OFF_DAYS,
    DEFAULT_SICK_LEAVE_DAYS,
    LeaveType,
)
from app.core.deps import (
    CurrentActor,
    DbSession,
    check_self_or_hr,
    require_admin,
    require_hr_or_admin,
)
from app.core.security import generate_temp_password, hash_password
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.models.leave_balance import LeaveBalance
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeCreateResponse,
    EmployeeOut,
    EmployeeUpdate,
)
from app.services.attendance import get_today_status
from app.services.login_id import generate_login_id

router = APIRouter(prefix="/employees", tags=["Employees"])

# Fields an employee is allowed to self-edit
EMPLOYEE_EDITABLE_FIELDS = {"phone", "address", "profile_picture_url"}


@router.post("", response_model=EmployeeCreateResponse, status_code=201)
async def create_employee(
    data: EmployeeCreate,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> EmployeeCreateResponse:
    """HR/Admin: create a new employee with auto-generated login ID and temp password."""
    # Check email uniqueness
    existing = await db.execute(
        select(Employee).where(Employee.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee with this email already exists",
        )

    temp_password = generate_temp_password()
    join_year = data.date_of_joining.year
    login_id = await generate_login_id(db, data.full_name, join_year)

    employee = Employee(
        employee_code=login_id,
        email=data.email,
        password_hash=hash_password(temp_password),
        full_name=data.full_name,
        phone=data.phone,
        department=data.department,
        job_title=data.job_title,
        date_of_joining=data.date_of_joining,
        address=data.address,
        profile_picture_url=data.profile_picture_url,
        must_reset_password=True,
    )
    db.add(employee)
    await db.flush()

    # Create default leave balances for current year
    current_year = date.today().year
    for leave_type, days in [
        (LeaveType.PAID_TIME_OFF, DEFAULT_PAID_TIME_OFF_DAYS),
        (LeaveType.SICK_LEAVE, DEFAULT_SICK_LEAVE_DAYS),
    ]:
        balance = LeaveBalance(
            employee_id=employee.id,
            leave_type=leave_type,
            year=current_year,
            allocated_days=days,
            used_days=0,
        )
        db.add(balance)

    await db.flush()
    await db.refresh(employee)

    return EmployeeCreateResponse(
        **EmployeeOut.model_validate(employee).model_dump(),
        login_id=login_id,
        temporary_password=temp_password,
    )


@router.get("", response_model=list[EmployeeOut])
async def list_employees(
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
    search: str | None = None,
    department: str | None = None,
    job_title: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[EmployeeOut]:
    """HR/Admin: list employees with search/filter and today_status."""
    stmt = select(Employee).where(Employee.is_active == True)  # noqa: E712

    if search:
        stmt = stmt.where(Employee.full_name.ilike(f"%{search}%"))
    if department:
        stmt = stmt.where(Employee.department.ilike(f"%{department}%"))
    if job_title:
        stmt = stmt.where(Employee.job_title.ilike(f"%{job_title}%"))

    stmt = stmt.order_by(Employee.full_name).limit(limit).offset(offset)
    result = await db.execute(stmt)
    employees = result.scalars().all()

    out = []
    for emp in employees:
        emp_out = EmployeeOut.model_validate(emp)
        emp_out.today_status = await get_today_status(db, emp.id)
        out.append(emp_out)

    return out


@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(
    employee_id: uuid.UUID,
    actor_info: CurrentActor,
    db: DbSession,
) -> EmployeeOut:
    """HR/Admin: any employee. Employee: self only."""
    actor, actor_type = actor_info
    check_self_or_hr(actor, actor_type, employee_id)

    result = await db.execute(
        select(Employee).where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    emp_out = EmployeeOut.model_validate(employee)
    emp_out.today_status = await get_today_status(db, employee.id)
    return emp_out


@router.patch("/{employee_id}", response_model=EmployeeOut)
async def update_employee(
    employee_id: uuid.UUID,
    data: EmployeeUpdate,
    actor_info: CurrentActor,
    db: DbSession,
) -> EmployeeOut:
    """HR/Admin: any field, any employee. Employee: self only, restricted fields."""
    actor, actor_type = actor_info
    check_self_or_hr(actor, actor_type, employee_id)

    result = await db.execute(
        select(Employee).where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    update_data = data.model_dump(exclude_unset=True)

    # If the caller is an employee, restrict to allowed fields
    if actor_type == ActorType.EMPLOYEE:
        forbidden = set(update_data.keys()) - EMPLOYEE_EDITABLE_FIELDS
        if forbidden:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Employees cannot edit: {', '.join(sorted(forbidden))}",
            )

    for field, value in update_data.items():
        setattr(employee, field, value)

    await db.flush()
    await db.refresh(employee)

    emp_out = EmployeeOut.model_validate(employee)
    emp_out.today_status = await get_today_status(db, employee.id)
    return emp_out


@router.patch("/{employee_id}/deactivate", response_model=EmployeeOut)
async def deactivate_employee(
    employee_id: uuid.UUID,
    db: DbSession,
    admin: HROfficer = Depends(require_admin),
) -> EmployeeOut:
    """Admin only: soft-delete by setting is_active = false."""
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    employee.is_active = False
    await db.flush()
    await db.refresh(employee)
    return EmployeeOut.model_validate(employee)
