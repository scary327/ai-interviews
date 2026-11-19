"""widen question index check to eight questions

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-19 11:10:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0003"
down_revision: Union[str, Sequence[str], None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("evaluations_question_index_check", "evaluations", schema="ai", type_="check")
    op.create_check_constraint(
        "evaluations_question_index_check",
        "evaluations",
        "question_index BETWEEN 0 AND 7",
        schema="ai",
    )


def downgrade() -> None:
    op.drop_constraint("evaluations_question_index_check", "evaluations", schema="ai", type_="check")
    op.execute(
        "ALTER TABLE ai.evaluations ADD CONSTRAINT evaluations_question_index_check "
        "CHECK (question_index BETWEEN 0 AND 4) NOT VALID"
    )
