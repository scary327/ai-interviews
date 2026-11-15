"""create messages

Revision ID: 0001
Revises:
Create Date: 2026-11-05 22:22:53.518903

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "messages",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("interview_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("clock_timestamp()"),
            nullable=False,
        ),
        sa.CheckConstraint("role IN ('interviewer', 'candidate')", name="messages_role_check"),
        sa.PrimaryKeyConstraint("id"),
        schema="ai",
    )
    op.create_index(
        "ix_messages_interview_id_created_at",
        "messages",
        ["interview_id", "created_at"],
        unique=False,
        schema="ai",
    )


def downgrade() -> None:
    op.drop_index("ix_messages_interview_id_created_at", table_name="messages", schema="ai")
    op.drop_table("messages", schema="ai")
