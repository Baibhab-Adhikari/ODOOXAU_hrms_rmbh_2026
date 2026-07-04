# app/schemas/attendance.py
"""Attendance schemas."""

import uuid
from datetime import date, time

from pydantic import BaseModel, ConfigDict


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    check_in: time | None = None
    check_out: time | None = None
    status: str
    work_hours: float | None = None  # computed from check_in/check_out
    extra_hours: float | None = None  # work_hours - standard shift


class AttendanceListOut(BaseModel):
    """For GET /attendance (HR view) — includes employee name for display."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    employee_name: str | None = None
    date: date
    check_in: time | None = None
    check_out: time | None = None
    status: str
    work_hours: float | None = None
    extra_hours: float | None = None
