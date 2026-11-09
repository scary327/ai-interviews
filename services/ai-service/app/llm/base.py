from collections.abc import AsyncIterator, Sequence
from typing import Literal, Protocol, TypedDict


class ChatMessage(TypedDict):
    role: Literal["system", "user", "assistant"]
    content: str


class LLMProvider(Protocol):
    async def chat(
        self, messages: Sequence[ChatMessage], *, max_tokens: int, json_mode: bool = False
    ) -> str: ...

    def stream(self, messages: Sequence[ChatMessage], *, max_tokens: int) -> AsyncIterator[str]: ...

    async def close(self) -> None: ...
