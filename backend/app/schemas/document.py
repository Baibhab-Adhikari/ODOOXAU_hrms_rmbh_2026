# app/schemas/document.py
"""Document schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    employee_id: uuid.UUID
    doc_type: str
    file_url: str


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    doc_type: str
    file_url: str
    uploaded_at: datetime
