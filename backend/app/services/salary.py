# app/services/salary.py
"""Salary computation service — pure function + DB operations.

Calculation logic (from wireframe worked examples):
- Admin sets a wage and component percentages.
- Basic = basic_percent % of wage (e.g. 50% of ₹50,000 = ₹25,000).
- HRA = hra_percent % of Basic (e.g. 50% of ₹25,000 = ₹12,500).
- Allowances = HRA + standard_allowance + performance_bonus +
               leave_travel_allowance + fixed_allowance.
- PF = pf_percent % of Basic.
- Deductions = PF + professional_tax.
- Net Pay = Basic + Allowances - Deductions.
"""

import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.salary_structure import SalaryStructure
from app.schemas.salary_structure import SalaryComponentInput, SalaryStructureOut, SalaryStructureListOut


def compute_salary_structure(components: SalaryComponentInput) -> dict:
    """Pure function: compute salary breakdown from wage + percentages.

    Returns a dict with top-level aggregates and a detailed salary_components JSONB.
    """
    wage = components.wage
    basic_pay = round(wage * components.basic_percent / 100, 2)

    # Allowance components
    hra = round(basic_pay * components.hra_percent / 100, 2)
    standard_allowance = round(components.standard_allowance, 2)
    performance_bonus = round(components.performance_bonus, 2)
    leave_travel_allowance = round(components.leave_travel_allowance, 2)
    fixed_allowance = round(components.fixed_allowance, 2)

    total_allowances = round(
        hra + standard_allowance + performance_bonus
        + leave_travel_allowance + fixed_allowance,
        2,
    )

    # Deduction components
    pf = round(basic_pay * components.pf_percent / 100, 2)
    professional_tax = round(components.professional_tax, 2)
    total_deductions = round(pf + professional_tax, 2)

    net_pay = round(basic_pay + total_allowances - total_deductions, 2)

    salary_components = {
        "wage": wage,
        "basic": {"percent_of_wage": components.basic_percent, "amount": basic_pay},
        "allowances": {
            "hra": {"percent_of_basic": components.hra_percent, "amount": hra},
            "standard_allowance": standard_allowance,
            "performance_bonus": performance_bonus,
            "leave_travel_allowance": leave_travel_allowance,
            "fixed_allowance": fixed_allowance,
            "total": total_allowances,
        },
        "deductions": {
            "provident_fund": {"percent_of_basic": components.pf_percent, "amount": pf},
            "professional_tax": professional_tax,
            "total": total_deductions,
        },
        "net_pay": net_pay,
    }

    return {
        "basic_pay": basic_pay,
        "allowances": total_allowances,
        "deductions": total_deductions,
        "net_pay": net_pay,
        "salary_components": salary_components,
    }


async def create_salary_structure(
    db: AsyncSession,
    employee_id: uuid.UUID,
    updater_id: uuid.UUID,
    company_id: uuid.UUID,
    components: SalaryComponentInput,
    effective_from: date,
) -> SalaryStructureOut:
    """Create a salary structure for an employee (one per employee)."""
    result = await db.execute(
        select(SalaryStructure)
        .join(Employee, SalaryStructure.employee_id == Employee.id)
        .where(
            SalaryStructure.employee_id == employee_id,
            Employee.company_id == company_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Salary structure already exists for this employee. Use PATCH to update.",
        )

    computed = compute_salary_structure(components)
    salary = SalaryStructure(
        employee_id=employee_id,
        updated_by=updater_id,
        effective_from=effective_from,
        **computed,
    )
    db.add(salary)
    await db.flush()
    await db.refresh(salary)
    return SalaryStructureOut.model_validate(salary)


async def update_salary_structure(
    db: AsyncSession,
    salary_id: uuid.UUID,
    updater_id: uuid.UUID,
    company_id: uuid.UUID,
    components: SalaryComponentInput | None = None,
    effective_from: date | None = None,
) -> SalaryStructureOut:
    """Update an existing salary structure."""
    result = await db.execute(
        select(SalaryStructure)
        .join(Employee, SalaryStructure.employee_id == Employee.id)
        .where(
            SalaryStructure.id == salary_id,
            Employee.company_id == company_id
        )
    )
    salary = result.scalar_one_or_none()
    if salary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary structure not found",
        )

    if components is not None:
        computed = compute_salary_structure(components)
        salary.basic_pay = computed["basic_pay"]
        salary.allowances = computed["allowances"]
        salary.deductions = computed["deductions"]
        salary.net_pay = computed["net_pay"]
        salary.salary_components = computed["salary_components"]

    if effective_from is not None:
        salary.effective_from = effective_from

    salary.updated_by = updater_id
    await db.flush()
    await db.refresh(salary)
    return SalaryStructureOut.model_validate(salary)


async def get_salary_by_employee(
    db: AsyncSession,
    employee_id: uuid.UUID,
) -> SalaryStructureOut:
    """Get salary structure for one employee."""
    result = await db.execute(
        select(SalaryStructure).where(SalaryStructure.employee_id == employee_id)
    )
    salary = result.scalar_one_or_none()
    if salary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No salary structure found for this employee",
        )
    return SalaryStructureOut.model_validate(salary)


async def get_all_salary_structures(
    db: AsyncSession,
    company_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
) -> list[SalaryStructureListOut]:
    """Get all salary structures with employee name and job title."""
    stmt = (
        select(SalaryStructure, Employee.full_name, Employee.job_title)
        .join(Employee, SalaryStructure.employee_id == Employee.id)
        .where(Employee.company_id == company_id)
        .order_by(Employee.full_name)
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    out_list = []
    for row in rows:
        salary_record = row[0]
        employee_name = row[1]
        job_title = row[2]
        
        out_dict = SalaryStructureListOut.model_validate(salary_record).model_dump()
        out_dict["employee_name"] = employee_name
        out_dict["job_title"] = job_title
        out_list.append(SalaryStructureListOut(**out_dict))
        
    return out_list
