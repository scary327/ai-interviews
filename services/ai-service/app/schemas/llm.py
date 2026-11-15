from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, Field, field_validator

from app.schemas.validators import not_blank

CriterionKey = Literal["technical_knowledge", "practical_depth", "communication", "problem_solving"]
CRITERION_KEYS: tuple[CriterionKey, ...] = (
    "technical_knowledge",
    "practical_depth",
    "communication",
    "problem_solving",
)
PLAN_SIZE = 5


def _cut_utf16(value: str, limit: int) -> str:
    encoded = value.encode("utf-16-le")
    if len(encoded) <= limit * 2:
        return value
    return encoded[: limit * 2].decode("utf-16-le", errors="ignore").rstrip()


def _text(limit: int):
    def check(value: str) -> str:
        return _cut_utf16(not_blank(value), limit)

    return AfterValidator(check)


def _items(limit: int):
    def check(values: list[str]) -> list[str]:
        cleaned = [_cut_utf16(v.strip(), 500) for v in values if v.strip()]
        return cleaned[:limit]

    return AfterValidator(check)


class PlanQuestion(BaseModel):
    text: Annotated[str, _text(500)]
    topic: Annotated[str, _text(100)]


class PlanOut(BaseModel):
    questions: list[PlanQuestion] = Field(min_length=PLAN_SIZE)

    @field_validator("questions")
    @classmethod
    def keep_plan_size(cls, questions: list[PlanQuestion]) -> list[PlanQuestion]:
        return questions[:PLAN_SIZE]


class AnswerEvaluationOut(BaseModel):
    score: int = Field(ge=0, le=100)
    comment: Annotated[str, _text(1000)]
    needs_follow_up: bool
    follow_up_question: Annotated[str, _text(500)]


class CriterionOut(BaseModel):
    key: CriterionKey
    score: int = Field(ge=0, le=100)
    comment: Annotated[str, _text(1000)]


class ReportOut(BaseModel):
    summary: Annotated[str, _text(4000)]
    strengths: Annotated[list[str], _items(10)]
    weaknesses: Annotated[list[str], _items(10)]
    criteria: list[CriterionOut]
    recommendations: Annotated[list[str], _items(10)]

    @field_validator("criteria")
    @classmethod
    def all_keys_once(cls, criteria: list[CriterionOut]) -> list[CriterionOut]:
        if sorted(c.key for c in criteria) != sorted(CRITERION_KEYS):
            raise ValueError(f"must contain each of {', '.join(CRITERION_KEYS)} exactly once")
        return criteria

    @field_validator("recommendations")
    @classmethod
    def at_least_three(cls, recommendations: list[str]) -> list[str]:
        if len(recommendations) < 3:
            raise ValueError("must contain at least 3 recommendations")
        return recommendations
