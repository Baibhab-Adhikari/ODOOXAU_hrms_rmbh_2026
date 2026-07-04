# app/models/hr_officer.py
"""HR Officers table — admin and hr roles."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class HROfficer(Base):
    __tablename__ = "hr_officers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    reviewed_leave_requests: Mapped[list["LeaveRequest"]] = relationship(  # noqa: F821
        "LeaveRequest",
        back_populates="reviewer",
        lazy="selectin",
    )
    updated_salary_structures: Mapped[list["SalaryStructure"]] = relationship(  # noqa: F821
        "SalaryStructure",
        back_populates="updater",
        lazy="selectin",
    )
