from pydantic import BaseModel

from app.schemas.llm import CriterionKey


class CriterionScore(BaseModel):
    key: CriterionKey
    score: int
    comment: str


class EvaluationOut(BaseModel):
    score: int
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    criteria: list[CriterionScore]
    recommendations: list[str]
