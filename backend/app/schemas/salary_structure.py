# app/schemas/salary_structure.py
"""Salary structure schemas."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class SalaryComponentInput(BaseModel):
    """Input: wage + percentage-based components from the admin."""
    wage: float
    basic_percent: float = 50.0  # % of wage
    hra_percent: float = 50.0  # % of basic
    standard_allowance: float = 0.0  # fixed amount
    performance_bonus: float = 0.0  # fixed amount
    leave_travel_allowance: float = 0.0  # fixed amount
    fixed_allowance: float = 0.0  # fixed amount
    pf_percent: float = 12.0  # % of basic
    professional_tax: float = 200.0  # fixed amount


class SalaryStructureCreate(BaseModel):
    employee_id: uuid.UUID
    effective_from: date
    components: SalaryComponentInput


class SalaryStructureUpdate(BaseModel):
    effective_from: date | None = None
    components: SalaryComponentInput | None = None


class SalaryStructureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    updated_by: uuid.UUID
    basic_pay: float
    allowances: float
    deductions: float
    net_pay: float
    effective_from: date
    salary_components: dict | None = None
    created_at: datetime


class SalaryStructureListOut(SalaryStructureOut):
    employee_name: str | None = None
    job_title: str | None = None
