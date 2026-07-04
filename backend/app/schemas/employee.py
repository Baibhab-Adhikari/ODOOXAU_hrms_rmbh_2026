# app/schemas/employee.py
"""Employee schemas."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    department: str | None = None
    job_title: str | None = None
    date_of_joining: date
    address: str | None = None
    profile_picture_url: str | None = None


class EmployeeUpdate(BaseModel):
    """All fields optional. Route logic restricts which fields employees can edit."""
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    job_title: str | None = None
    address: str | None = None
    profile_picture_url: str | None = None
    date_of_joining: date | None = None


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_code: str
    email: str
    email_verified: bool
    full_name: str
    phone: str | None = None
    address: str | None = None
    job_title: str | None = None
    department: str | None = None
    date_of_joining: date
    profile_picture_url: str | None = None
    is_active: bool
    must_reset_password: bool
    created_at: datetime
    today_status: str | None = None  # computed, not stored


class EmployeeCreateResponse(EmployeeOut):
    """Returned on POST /employees — includes the generated credentials."""
    login_id: str
    temporary_password: str
