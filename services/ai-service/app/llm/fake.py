import asyncio
from collections.abc import AsyncIterator, Sequence

from app.llm.base import ChatMessage


class FakeProvider:
    async def close(self) -> None:
        pass

    async def chat(
        self, messages: Sequence[ChatMessage], *, max_tokens: int, json_mode: bool = False
    ) -> str:
        if json_mode:
            raise NotImplementedError("FakeProvider does not produce JSON")
        answer = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return f"Принял ответ: «{answer}». Следующий вопрос: расскажите о проекте, которым вы гордитесь."

    async def stream(self, messages: Sequence[ChatMessage], *, max_tokens: int) -> AsyncIterator[str]:
        text = await self.chat(messages, max_tokens=max_tokens)
        for i, word in enumerate(text.split(" ")):
            await asyncio.sleep(0.05)
            yield word if i == 0 else f" {word}"
