# app/models/__init__.py
"""Re-export all models for convenient imports."""

from app.models.company import Company
from app.models.hr_officer import HROfficer
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.leave_balance import LeaveBalance
from app.models.salary_structure import SalaryStructure
from app.models.document import Document

__all__ = [
    "Company",
    "HROfficer",
    "Employee",
    "Attendance",
    "LeaveRequest",
    "LeaveBalance",
    "SalaryStructure",
    "Document",
]
