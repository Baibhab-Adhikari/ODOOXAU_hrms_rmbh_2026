# app/services/attendance.py
"""Attendance service — check-in/out, status derivation, queries."""

import uuid
from datetime import date, datetime, time, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AttendanceStatus, STANDARD_SHIFT_HOURS
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.schemas.attendance import AttendanceListOut, AttendanceOut


def _compute_hours(check_in: time | None, check_out: time | None) -> tuple[float | None, float | None]:
    """Derive work_hours and extra_hours from check_in/check_out times."""
    if check_in is None or check_out is None:
        return None, None

    # Combine with a dummy date for timedelta calculation
    dt_in = datetime.combine(date.today(), check_in)
    dt_out = datetime.combine(date.today(), check_out)
    diff = (dt_out - dt_in).total_seconds() / 3600.0
    work_hours = round(max(diff, 0), 2)
    extra_hours = round(work_hours - STANDARD_SHIFT_HOURS, 2)
    return work_hours, extra_hours


def _attendance_to_out(record: Attendance) -> AttendanceOut:
    work_hours, extra_hours = _compute_hours(record.check_in, record.check_out)
    return AttendanceOut(
        id=record.id,
        employee_id=record.employee_id,
        date=record.date,
        check_in=record.check_in,
        check_out=record.check_out,
        status=record.status,
        work_hours=work_hours,
        extra_hours=extra_hours,
    )


def _attendance_to_list_out(record: Attendance, employee_name: str | None = None) -> AttendanceListOut:
    work_hours, extra_hours = _compute_hours(record.check_in, record.check_out)
    return AttendanceListOut(
        id=record.id,
        employee_id=record.employee_id,
        employee_name=employee_name,
        date=record.date,
        check_in=record.check_in,
        check_out=record.check_out,
        status=record.status,
        work_hours=work_hours,
        extra_hours=extra_hours,
    )


async def check_in(db: AsyncSession, employee_id: uuid.UUID) -> AttendanceOut:
    """Idempotent check-in: get-or-create today's row, set check_in if not already set."""
    today = date.today()

    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.date == today,
        )
    )
    record = result.scalar_one_or_none()

    if record is None:
        record = Attendance(
            employee_id=employee_id,
            date=today,
            check_in=datetime.now(timezone.utc).time(),
            status=AttendanceStatus.PRESENT,
        )
        db.add(record)
    elif record.check_in is None:
        record.check_in = datetime.now(timezone.utc).time()
        record.status = AttendanceStatus.PRESENT

    await db.flush()
    await db.refresh(record)
    return _attendance_to_out(record)


async def check_out(db: AsyncSession, employee_id: uuid.UUID) -> AttendanceOut:
    """Set check_out on today's attendance row."""
    today = date.today()

    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.date == today,
        )
    )
    record = result.scalar_one_or_none()

    if record is None or record.check_in is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must check in before checking out",
        )

    record.check_out = datetime.now(timezone.utc).time()
    await db.flush()
    await db.refresh(record)
    return _attendance_to_out(record)


async def get_employee_attendance(
    db: AsyncSession,
    employee_id: uuid.UUID,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[AttendanceOut]:
    """Get attendance records for one employee in a date range."""
    if start_date is None:
        start_date = date.today().replace(day=1)
    if end_date is None:
        end_date = date.today()

    result = await db.execute(
        select(Attendance)
        .where(
            Attendance.employee_id == employee_id,
            Attendance.date >= start_date,
            Attendance.date <= end_date,
        )
        .order_by(Attendance.date.desc())
    )
    records = result.scalars().all()
    return [_attendance_to_out(r) for r in records]


async def get_all_attendance(
    db: AsyncSession,
    target_date: date | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[AttendanceListOut]:
    """Get all employees' attendance for a given date (HR view)."""
    from app.models.employee import Employee

    if target_date is None:
        target_date = date.today()

    stmt = (
        select(Attendance, Employee.full_name)
        .join(Employee, Attendance.employee_id == Employee.id)
        .where(Attendance.date == target_date)
    )

    if search:
        stmt = stmt.where(Employee.full_name.ilike(f"%{search}%"))

    stmt = stmt.order_by(Employee.full_name).limit(limit).offset(offset)
    result = await db.execute(stmt)
    rows = result.all()

    return [_attendance_to_list_out(row[0], employee_name=row[1]) for row in rows]


async def get_today_status(db: AsyncSession, employee_id: uuid.UUID) -> str:
    """Derive today's status for an employee.

    Priority:
    1. Approved leave covering today → on_leave
    2. Attendance row with check_in → present
    3. Otherwise → absent
    """
    today = date.today()

    # Check for approved leave covering today
    leave_result = await db.execute(
        select(LeaveRequest).where(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.status == "approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
        )
    )
    if leave_result.scalar_one_or_none():
        return AttendanceStatus.ON_LEAVE

    # Check for attendance with check_in
    att_result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.date == today,
        )
    )
    record = att_result.scalar_one_or_none()
    if record and record.check_in is not None:
        return AttendanceStatus.PRESENT

    return AttendanceStatus.ABSENT
