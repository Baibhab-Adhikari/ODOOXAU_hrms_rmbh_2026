# app/api/v1/salary_structures.py
"""Salary structure routes."""

import uuid

from fastapi import APIRouter, Depends

from app.core.deps import CurrentActor, DbSession, check_self_or_hr, require_employee, require_hr_or_admin
from app.models.employee import Employee
from app.models.hr_officer import HROfficer
from app.schemas.salary_structure import (
    SalaryStructureCreate,
    SalaryStructureOut,
    SalaryStructureUpdate,
)
from app.services import salary as salary_service

router = APIRouter(prefix="/salary-structures", tags=["Salary Structures"])


@router.get("/me", response_model=SalaryStructureOut)
async def get_my_salary(
    db: DbSession,
    employee: Employee = Depends(require_employee),
) -> SalaryStructureOut:
    """Employee: view own salary structure (read-only)."""
    return await salary_service.get_salary_by_employee(db, employee.id)


@router.get("/{employee_id}", response_model=SalaryStructureOut)
async def get_employee_salary(
    employee_id: uuid.UUID,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> SalaryStructureOut:
    """HR/Admin: view any employee's salary structure."""
    return await salary_service.get_salary_by_employee(db, employee_id)


@router.post("", response_model=SalaryStructureOut, status_code=201)
async def create_salary_structure(
    data: SalaryStructureCreate,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> SalaryStructureOut:
    """HR/Admin: create a salary structure (runs computation service)."""
    return await salary_service.create_salary_structure(
        db, data.employee_id, hr.id, data.components, data.effective_from
    )


@router.patch("/{salary_id}", response_model=SalaryStructureOut)
async def update_salary_structure(
    salary_id: uuid.UUID,
    data: SalaryStructureUpdate,
    db: DbSession,
    hr: HROfficer = Depends(require_hr_or_admin),
) -> SalaryStructureOut:
    """HR/Admin: update a salary structure (re-runs computation)."""
    return await salary_service.update_salary_structure(
        db, salary_id, hr.id, data.components, data.effective_from
    )
