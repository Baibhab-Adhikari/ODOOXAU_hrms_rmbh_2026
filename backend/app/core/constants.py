# app/core/constants.py
"""Application-wide constants — single source of truth for magic numbers."""

from enum import StrEnum


# ── Leave defaults (days per year, used when creating a new employee) ──
DEFAULT_PAID_TIME_OFF_DAYS: int = 24
DEFAULT_SICK_LEAVE_DAYS: int = 9

# ── Attendance ──
STANDARD_SHIFT_HOURS: float = 8.0

# ── Leave types (matches wireframe legend exactly) ──
class LeaveType(StrEnum):
    PAID_TIME_OFF = "paid_time_off"
    SICK_LEAVE = "sick_leave"
    UNPAID_LEAVE = "unpaid_leave"


# ── Leave request statuses ──
class LeaveStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# ── Attendance status ──
class AttendanceStatus(StrEnum):
    PRESENT = "present"
    ABSENT = "absent"
    ON_LEAVE = "on_leave"


# ── Actor types (for JWT) ──
class ActorType(StrEnum):
    EMPLOYEE = "employee"
    HR_OFFICER = "hr_officer"
