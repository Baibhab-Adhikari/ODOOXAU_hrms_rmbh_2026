# app/api/v1/attendance.py
"""Attendance routes."""

import uuid
from datetime import date

from fastapi import APIRouter, Depends

from app.core.deps import CurrentActor, DbSession, require_employee, require_hr_or_admin
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.schemas.attendance import AttendanceListOut, AttendanceOut
from app.services import attendance as attendance_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/check-in", response_model=AttendanceOut)
async def check_in(
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> AttendanceOut:
    """Employee: idempotent check-in for today."""
    return await attendance_service.check_in(db, employee.id)


@router.post("/check-out", response_model=AttendanceOut)
async def check_out(
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> AttendanceOut:
    """Employee: check-out for today (must have checked in first)."""
    return await attendance_service.check_out(db, employee.id)


@router.get("/me", response_model=list[AttendanceOut])
async def get_my_attendance(
    db: DbSession,
    employee: Employee = Depends(require_employee),
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[AttendanceOut]:
    """Employee: own attendance for a date range (default: current month)."""
    return await attendance_service.get_employee_attendance(
        db, employee.id, start_date, end_date
    )


@router.get("", response_model=list[AttendanceListOut])
async def get_all_attendance(
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
    target_date: date | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AttendanceListOut]:
    """HR/Admin: all employees' attendance for a given date (default today)."""
    return await attendance_service.get_all_attendance(
        db, target_date, search, limit, offset
    )


@router.get("/{employee_id}", response_model=list[AttendanceOut])
async def get_employee_attendance(
    employee_id: uuid.UUID,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[AttendanceOut]:
    """HR/Admin: one employee's attendance history."""
    return await attendance_service.get_employee_attendance(
        db, employee_id, start_date, end_date
    )
