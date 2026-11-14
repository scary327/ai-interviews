import asyncio
import re
from collections.abc import AsyncIterator, Callable, Sequence
from typing import Any

from app.llm.base import ChatMessage, M
from app.schemas.llm import CRITERION_KEYS, PLAN_SIZE, AnswerEvaluationOut, PlanOut, ReportOut

_SHORT_ANSWER = 20
_GOODBYE = "Спасибо, вопросы закончились. Нажмите «Завершить»."


def _tag(messages: Sequence[ChatMessage], name: str) -> str | None:
    for message in reversed(messages):
        found = re.search(rf"<{name}>(.*?)</{name}>", message["content"], re.DOTALL)
        if found:
            return found.group(1).strip()
    return None


def _plan(messages: Sequence[ChatMessage]) -> dict[str, Any]:
    return {
        "questions": [
            {"text": f"Вопрос {i + 1}: расскажите о своём опыте с темой {i + 1}.", "topic": f"тема {i + 1}"}
            for i in range(PLAN_SIZE)
        ]
    }


def _evaluation(messages: Sequence[ChatMessage]) -> dict[str, Any]:
    answer = _tag(messages, "answer") or ""
    return {
        "score": 70,
        "comment": "Ответ по существу.",
        "needs_follow_up": len(answer) < _SHORT_ANSWER,
        "follow_up_question": "Приведите пример из практики.",
    }


def _report(messages: Sequence[ChatMessage]) -> dict[str, Any]:
    return {
        "summary": "Уверенные ответы по основным темам.",
        "strengths": ["Структурированные ответы"],
        "weaknesses": ["Мало примеров из практики"],
        "criteria": [
            {"key": key, "score": 70 + i % 2, "comment": "Комментарий по критерию."}
            for i, key in enumerate(CRITERION_KEYS)
        ],
        "recommendations": ["Готовить примеры из проектов", "Повторить основы", "Тренировать устные ответы"],
    }


_ANSWERS: dict[type, Callable[[Sequence[ChatMessage]], dict[str, Any]]] = {
    PlanOut: _plan,
    AnswerEvaluationOut: _evaluation,
    ReportOut: _report,
}


class FakeProvider:
    async def close(self) -> None:
        pass

    async def complete_json(
        self, messages: Sequence[ChatMessage], *, schema: type[M], max_tokens: int
    ) -> M:
        return schema.model_validate(_ANSWERS[schema](messages))

    async def stream(self, messages: Sequence[ChatMessage], *, max_tokens: int) -> AsyncIterator[str]:
        question = _tag(messages, "question")
        text = f"Понял, спасибо. {question}" if question else _GOODBYE
        for i, word in enumerate(text.split(" ")):
            await asyncio.sleep(0.05)
            yield word if i == 0 else f" {word}"
