# app/models/attendance.py
"""Attendance table — one row per employee per day."""

import uuid
from datetime import date, time

from sqlalchemy import Date, ForeignKey, String, Time, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    check_in: Mapped[time | None] = mapped_column(Time(timezone=True), nullable=True)
    check_out: Mapped[time | None] = mapped_column(Time(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="absent"
    )  # present / absent / on_leave

    # Relationships
    employee: Mapped["Employee"] = relationship(  # noqa: F821
        "Employee",
        back_populates="attendance_records",
        lazy="selectin",
    )
