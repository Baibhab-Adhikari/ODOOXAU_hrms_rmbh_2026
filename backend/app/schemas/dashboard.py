# app/schemas/dashboard.py
"""Dashboard response schemas."""

from pydantic import BaseModel
from typing import Optional


class EmployeeDashboardOut(BaseModel):
    today_shift: Optional[str] = None
    clock_in_time: Optional[str] = None
    annual_leave_remaining: int = 0
    sick_leave_remaining: int = 0
    next_holiday_name: Optional[str] = None
    next_holiday_date: Optional[str] = None


class RecentActivityOut(BaseModel):
    id: str
    message: str
    type: str  # "leave_approved", "absent", "check_in", "new_employee", "payroll"
    time: str


class DepartmentStatOut(BaseModel):
    dept: str
    count: int
    present: int


class HrDashboardOut(BaseModel):
    total_employees: int
    employees_added_this_month: int
    present_today: int
    attendance_rate: float
    pending_leaves: int
    monthly_payroll: float
    payroll_change_percent: float
    recent_activities: list[RecentActivityOut]
    department_stats: list[DepartmentStatOut]
