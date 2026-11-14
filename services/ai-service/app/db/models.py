from datetime import datetime
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, Index, MetaData, String, Text
from sqlalchemy import text as sql
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

SCHEMA = "ai"


class Base(DeclarativeBase):
    metadata = MetaData(schema=SCHEMA)


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        CheckConstraint("role IN ('interviewer', 'candidate')", name="messages_role_check"),
        Index("ix_messages_interview_id_created_at", "interview_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=sql("gen_random_uuid()"))
    interview_id: Mapped[UUID]
    role: Mapped[str] = mapped_column(String(20))
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=sql("clock_timestamp()")
    )
