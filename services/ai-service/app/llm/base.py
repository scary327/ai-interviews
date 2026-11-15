from collections.abc import AsyncGenerator, Sequence
from typing import Literal, Protocol, TypedDict, TypeVar

from pydantic import BaseModel

M = TypeVar("M", bound=BaseModel)


class ChatMessage(TypedDict):
    role: Literal["system", "user", "assistant"]
    content: str


class LLMProvider(Protocol):
    async def complete_json(
        self, messages: Sequence[ChatMessage], *, schema: type[M], max_tokens: int
    ) -> M: ...

    def stream(
        self, messages: Sequence[ChatMessage], *, max_tokens: int
    ) -> AsyncGenerator[str, None]: ...

    async def close(self) -> None: ...
