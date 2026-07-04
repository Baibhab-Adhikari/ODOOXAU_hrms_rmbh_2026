# app/schemas/leave_balance.py
"""Leave balance schemas."""

import uuid

from pydantic import BaseModel, ConfigDict


class LeaveBalanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    leave_type: str
    year: int
    allocated_days: int
    used_days: int
    remaining_days: int | None = None  # computed: allocated - used


class LeaveBalanceUpdate(BaseModel):
    allocated_days: int
