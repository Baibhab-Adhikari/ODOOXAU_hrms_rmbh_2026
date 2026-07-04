# app/api/v1/dashboard.py
"""Dashboard routes."""

from fastapi import APIRouter, Depends

from app.core.deps import CurrentActor, DbSession, require_employee, require_hr_or_admin
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.schemas.dashboard import EmployeeDashboardOut, HrDashboardOut
from app.services import dashboard as dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/employee", response_model=EmployeeDashboardOut)
async def get_employee_dashboard(
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> EmployeeDashboardOut:
    """Employee: View personalized dashboard stats."""
    return await dashboard_service.get_employee_dashboard(db, employee.id)


@router.get("/hr", response_model=HrDashboardOut)
async def get_hr_dashboard(
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> HrDashboardOut:
    """HR/Admin: View company-wide dashboard stats."""
    return await dashboard_service.get_hr_dashboard(db)
