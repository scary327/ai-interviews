"""create interview plans and evaluations

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-09 23:08:04.339643

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, Sequence[str], None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interview_plans",
        sa.Column("interview_id", sa.Uuid(), nullable=False),
        sa.Column("questions", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("clock_timestamp()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("interview_id"),
        schema="ai",
    )
    op.create_table(
        "evaluations",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("interview_id", sa.Uuid(), nullable=False),
        sa.Column("message_id", sa.Uuid(), nullable=False),
        sa.Column("question_index", sa.SmallInteger(), nullable=False),
        sa.Column("follow_up_no", sa.SmallInteger(), nullable=False),
        sa.Column("score", sa.SmallInteger(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("decision", sa.String(length=20), nullable=False),
        sa.Column("follow_up_question", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("clock_timestamp()"),
            nullable=False,
        ),
        sa.CheckConstraint("decision IN ('follow_up', 'next', 'finish')", name="evaluations_decision_check"),
        sa.CheckConstraint("follow_up_no BETWEEN 0 AND 1", name="evaluations_follow_up_no_check"),
        sa.CheckConstraint("question_index BETWEEN 0 AND 4", name="evaluations_question_index_check"),
        sa.CheckConstraint("score BETWEEN 0 AND 100", name="evaluations_score_check"),
        sa.ForeignKeyConstraint(["message_id"], ["ai.messages.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("message_id"),
        schema="ai",
    )
    op.create_index(
        "ix_evaluations_interview_id_created_at",
        "evaluations",
        ["interview_id", "created_at"],
        unique=False,
        schema="ai",
    )


def downgrade() -> None:
    op.drop_index("ix_evaluations_interview_id_created_at", table_name="evaluations", schema="ai")
    op.drop_table("evaluations", schema="ai")
    op.drop_table("interview_plans", schema="ai")
