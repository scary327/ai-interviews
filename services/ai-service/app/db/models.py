from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, MetaData, SmallInteger, String, Text
from sqlalchemy import text as sql
from sqlalchemy.dialects.postgresql import JSONB
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


class InterviewPlan(Base):
    __tablename__ = "interview_plans"

    interview_id: Mapped[UUID] = mapped_column(primary_key=True)
    questions: Mapped[list[dict[str, Any]]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=sql("clock_timestamp()")
    )


class Evaluation(Base):
    __tablename__ = "evaluations"
    __table_args__ = (
        CheckConstraint("question_index BETWEEN 0 AND 4", name="evaluations_question_index_check"),
        CheckConstraint("follow_up_no BETWEEN 0 AND 1", name="evaluations_follow_up_no_check"),
        CheckConstraint("score BETWEEN 0 AND 100", name="evaluations_score_check"),
        CheckConstraint("decision IN ('follow_up', 'next', 'finish')", name="evaluations_decision_check"),
        Index("ix_evaluations_interview_id_created_at", "interview_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=sql("gen_random_uuid()"))
    interview_id: Mapped[UUID]
    message_id: Mapped[UUID] = mapped_column(
        ForeignKey(f"{SCHEMA}.messages.id", ondelete="CASCADE"), unique=True
    )
    question_index: Mapped[int] = mapped_column(SmallInteger)
    follow_up_no: Mapped[int] = mapped_column(SmallInteger)
    score: Mapped[int] = mapped_column(SmallInteger)
    comment: Mapped[str] = mapped_column(Text)
    decision: Mapped[str] = mapped_column(String(20))
    follow_up_question: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=sql("clock_timestamp()")
    )
