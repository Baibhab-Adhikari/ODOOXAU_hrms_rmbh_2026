# app/schemas/company.py
"""Company settings schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_name: str
    login_prefix: str
    logo_url: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class CompanyUpdate(BaseModel):
    company_name: str | None = None
    logo_url: str | None = None
