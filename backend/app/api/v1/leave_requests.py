# app/api/v1/leave_requests.py
"""Leave request routes."""

import uuid
from datetime import date

from fastapi import APIRouter, Depends

from app.core.deps import DbSession, require_employee, require_hr_or_admin
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.schemas.leave_request import LeaveRequestAction, LeaveRequestCreate, LeaveRequestOut
from app.services import leave as leave_service

router = APIRouter(prefix="/leave-requests", tags=["Leave Requests"])


@router.post("", response_model=LeaveRequestOut, status_code=201)
async def create_leave_request(
    data: LeaveRequestCreate,
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> LeaveRequestOut:
    """Employee: submit a leave request (validates balance for paid/sick)."""
    return await leave_service.create_leave_request(db, employee.id, data)


@router.get("/me", response_model=list[LeaveRequestOut])
async def get_my_leave_requests(
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> list[LeaveRequestOut]:
    """Employee: own leave requests."""
    return await leave_service.get_employee_leave_requests(db, employee.id)


@router.get("", response_model=list[LeaveRequestOut])
async def get_all_leave_requests(
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
    status: str | None = None,
    employee_id: uuid.UUID | None = None,
    leave_type: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[LeaveRequestOut]:
    """HR/Admin: all leave requests with filters."""
    return await leave_service.get_all_leave_requests(
        db, status, employee_id, leave_type, start_date, end_date, limit, offset
    )


@router.patch("/{request_id}/approve", response_model=LeaveRequestOut)
async def approve_leave_request(
    request_id: uuid.UUID,
    data: LeaveRequestAction,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> LeaveRequestOut:
    """HR/Admin: approve a pending leave request (atomically updates balance)."""
    return await leave_service.approve_leave_request(
        db, request_id, hr.id, data.admin_comment
    )


@router.patch("/{request_id}/reject", response_model=LeaveRequestOut)
async def reject_leave_request(
    request_id: uuid.UUID,
    data: LeaveRequestAction,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> LeaveRequestOut:
    """HR/Admin: reject a pending leave request."""
    return await leave_service.reject_leave_request(
        db, request_id, hr.id, data.admin_comment
    )
