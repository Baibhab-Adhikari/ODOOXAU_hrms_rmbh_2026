# app/schemas/leave_request.py
"""Leave request schemas."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.constants import LeaveType


class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: str | None = None
    attachment_url: str | None = None

    @field_validator("attachment_url")
    @classmethod
    def sick_leave_requires_attachment(cls, v: str | None, info) -> str | None:
        if (
            "leave_type" in info.data
            and info.data["leave_type"] == LeaveType.SICK_LEAVE
            and not v
        ):
            raise ValueError(
                "attachment_url is required for sick leave (medical certificate)"
            )
        return v

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("end_date must be on or after start_date")
        return v


class LeaveRequestAction(BaseModel):
    """Body for approve/reject endpoints."""
    admin_comment: str | None = None


class LeaveRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    leave_type: str
    start_date: date
    end_date: date
    remarks: str | None = None
    attachment_url: str | None = None
    status: str
    reviewed_by: uuid.UUID | None = None
    admin_comment: str | None = None
    created_at: datetime
    day_count: int | None = None  # computed
