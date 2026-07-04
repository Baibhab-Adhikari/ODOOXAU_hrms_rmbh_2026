# app/api/v1/leave_balances.py
"""Leave balance routes."""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.core.deps import DbSession, require_employee, require_hr_or_admin
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.models.leave_balance import LeaveBalance
from app.schemas.leave_balance import LeaveBalanceOut, LeaveBalanceUpdate

router = APIRouter(prefix="/leave-balances", tags=["Leave Balances"])


def _balance_to_out(b: LeaveBalance) -> LeaveBalanceOut:
    return LeaveBalanceOut(
        id=b.id,
        employee_id=b.employee_id,
        leave_type=b.leave_type,
        year=b.year,
        allocated_days=b.allocated_days,
        used_days=b.used_days,
        remaining_days=b.allocated_days - b.used_days,
    )


@router.get("/me", response_model=list[LeaveBalanceOut])
async def get_my_leave_balances(
    db: DbSession,
    employee: Employee = Depends(require_employee),
    year: int | None = None,
) -> list[LeaveBalanceOut]:
    """Employee: own leave balances for a given year (default current)."""
    if year is None:
        year = date.today().year

    result = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == employee.id,
            LeaveBalance.year == year,
        )
    )
    return [_balance_to_out(b) for b in result.scalars().all()]


@router.get("", response_model=list[LeaveBalanceOut])
async def get_all_leave_balances(
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
    year: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[LeaveBalanceOut]:
    """HR/Admin: all employees' leave balances for a year (Allocation tab)."""
    if year is None:
        year = date.today().year

    result = await db.execute(
        select(LeaveBalance)
        .where(LeaveBalance.year == year)
        .limit(limit)
        .offset(offset)
    )
    return [_balance_to_out(b) for b in result.scalars().all()]


@router.patch("/{balance_id}", response_model=LeaveBalanceOut)
async def update_leave_balance(
    balance_id: uuid.UUID,
    data: LeaveBalanceUpdate,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> LeaveBalanceOut:
    """HR/Admin: adjust allocated_days for one employee/type/year."""
    result = await db.execute(
        select(LeaveBalance).where(LeaveBalance.id == balance_id)
    )
    balance = result.scalar_one_or_none()
    if balance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave balance not found",
        )

    balance.allocated_days = data.allocated_days
    await db.flush()
    await db.refresh(balance)
    return _balance_to_out(balance)
