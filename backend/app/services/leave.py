# app/services/leave.py
"""Leave request and leave balance service."""

import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import LeaveStatus, LeaveType
from app.models.leave_balance import LeaveBalance
from app.models.leave_request import LeaveRequest
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestOut


def calculate_day_count(start_date: date, end_date: date) -> int:
    """Calculate inclusive day count between two dates."""
    return (end_date - start_date).days + 1


def _request_to_out(req: LeaveRequest) -> LeaveRequestOut:
    return LeaveRequestOut(
        id=req.id,
        employee_id=req.employee_id,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        remarks=req.remarks,
        attachment_url=req.attachment_url,
        status=req.status,
        reviewed_by=req.reviewed_by,
        admin_comment=req.admin_comment,
        created_at=req.created_at,
        day_count=calculate_day_count(req.start_date, req.end_date),
    )


async def create_leave_request(
    db: AsyncSession,
    employee_id: uuid.UUID,
    data: LeaveRequestCreate,
) -> LeaveRequestOut:
    """Create a leave request, validating balance for paid/sick leave."""
    day_count = calculate_day_count(data.start_date, data.end_date)
    current_year = data.start_date.year

    # Validate balance for paid_time_off and sick_leave
    if data.leave_type in (LeaveType.PAID_TIME_OFF, LeaveType.SICK_LEAVE):
        result = await db.execute(
            select(LeaveBalance).where(
                LeaveBalance.employee_id == employee_id,
                LeaveBalance.leave_type == data.leave_type,
                LeaveBalance.year == current_year,
            )
        )
        balance = result.scalar_one_or_none()
        if balance is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No leave balance found for {data.leave_type} in {current_year}",
            )
        remaining = balance.allocated_days - balance.used_days
        if day_count > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient {data.leave_type} balance. "
                       f"Requested: {day_count} days, Available: {remaining} days",
            )

    leave_request = LeaveRequest(
        employee_id=employee_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
        remarks=data.remarks,
        attachment_url=data.attachment_url,
        status=LeaveStatus.PENDING,
    )
    db.add(leave_request)
    await db.flush()
    await db.refresh(leave_request)
    return _request_to_out(leave_request)


async def approve_leave_request(
    db: AsyncSession,
    request_id: uuid.UUID,
    reviewer_id: uuid.UUID,
    admin_comment: str | None = None,
) -> LeaveRequestOut:
    """Approve a leave request and atomically increment used_days."""
    result = await db.execute(
        select(LeaveRequest).where(LeaveRequest.id == request_id)
    )
    leave_req = result.scalar_one_or_none()
    if leave_req is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )
    if leave_req.status != LeaveStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve a request with status '{leave_req.status}'",
        )

    day_count = calculate_day_count(leave_req.start_date, leave_req.end_date)

    # Atomically update balance for paid/sick leave
    if leave_req.leave_type in (LeaveType.PAID_TIME_OFF, LeaveType.SICK_LEAVE):
        bal_result = await db.execute(
            select(LeaveBalance).where(
                LeaveBalance.employee_id == leave_req.employee_id,
                LeaveBalance.leave_type == leave_req.leave_type,
                LeaveBalance.year == leave_req.start_date.year,
            )
        )
        balance = bal_result.scalar_one_or_none()
        if balance is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Leave balance record not found",
            )
        remaining = balance.allocated_days - balance.used_days
        if day_count > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance to approve. "
                       f"Requested: {day_count} days, Available: {remaining} days",
            )
        balance.used_days += day_count

    leave_req.status = LeaveStatus.APPROVED
    leave_req.reviewed_by = reviewer_id
    leave_req.admin_comment = admin_comment

    await db.flush()
    await db.refresh(leave_req)
    return _request_to_out(leave_req)


async def reject_leave_request(
    db: AsyncSession,
    request_id: uuid.UUID,
    reviewer_id: uuid.UUID,
    admin_comment: str | None = None,
) -> LeaveRequestOut:
    """Reject a leave request — no balance change."""
    result = await db.execute(
        select(LeaveRequest).where(LeaveRequest.id == request_id)
    )
    leave_req = result.scalar_one_or_none()
    if leave_req is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )
    if leave_req.status != LeaveStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject a request with status '{leave_req.status}'",
        )

    leave_req.status = LeaveStatus.REJECTED
    leave_req.reviewed_by = reviewer_id
    leave_req.admin_comment = admin_comment

    await db.flush()
    await db.refresh(leave_req)
    return _request_to_out(leave_req)


async def get_employee_leave_requests(
    db: AsyncSession,
    employee_id: uuid.UUID,
) -> list[LeaveRequestOut]:
    """Get all leave requests for one employee."""
    result = await db.execute(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == employee_id)
        .order_by(LeaveRequest.created_at.desc())
    )
    return [_request_to_out(r) for r in result.scalars().all()]


async def get_all_leave_requests(
    db: AsyncSession,
    status_filter: str | None = None,
    employee_id: uuid.UUID | None = None,
    leave_type: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[LeaveRequestOut]:
    """Get all leave requests with optional filters (HR view)."""
    stmt = select(LeaveRequest)

    if status_filter:
        stmt = stmt.where(LeaveRequest.status == status_filter)
    if employee_id:
        stmt = stmt.where(LeaveRequest.employee_id == employee_id)
    if leave_type:
        stmt = stmt.where(LeaveRequest.leave_type == leave_type)
    if start_date:
        stmt = stmt.where(LeaveRequest.start_date >= start_date)
    if end_date:
        stmt = stmt.where(LeaveRequest.end_date <= end_date)

    stmt = stmt.order_by(LeaveRequest.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return [_request_to_out(r) for r in result.scalars().all()]
