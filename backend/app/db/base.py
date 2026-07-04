# app/db/base.py
"""Import all models so Base.metadata knows about them.

Use this module in main.py for create_all(). Models import Base from
base_class.py directly to avoid circular imports.
"""

from app.db.base_class import Base  # noqa: F401

# Import all models here so Base.metadata is fully populated.
from app.models.company_settings import CompanySettings  # noqa: F401
from app.models.hr_officer import HROfficer  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.attendance import Attendance  # noqa: F401
from app.models.leave_request import LeaveRequest  # noqa: F401
from app.models.leave_balance import LeaveBalance  # noqa: F401
from app.models.salary_structure import SalaryStructure  # noqa: F401
from app.models.document import Document  # noqa: F401
