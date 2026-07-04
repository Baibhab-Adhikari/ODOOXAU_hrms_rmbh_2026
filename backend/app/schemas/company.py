# app/schemas/company.py
"""Company settings schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanySettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_name: str
    logo_url: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class CompanySettingsUpdate(BaseModel):
    company_name: str | None = None
    logo_url: str | None = None
