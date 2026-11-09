import logging
import time
from collections.abc import AsyncIterator, Sequence
from typing import Any

import openai
from openai import AsyncOpenAI
from openai.types import CompletionUsage
from openai.types.chat import ChatCompletion

from app.llm.base import ChatMessage
from app.llm.errors import LLMError, LLMUnavailable

logger = logging.getLogger(__name__)

_NO_REASONING = {"reasoning": {"enabled": False}}
_TRANSIENT_STATUSES = {402, 408, 409, 429}
_CUT_REASONS = {"length", "content_filter"}


def _translate(e: Exception) -> LLMError:
    if isinstance(e, ValueError):
        logger.warning("RouterAI returned a malformed response: %s", type(e).__name__)
        return LLMUnavailable("LLM is unavailable")
    if isinstance(e, openai.APITimeoutError):
        logger.warning("RouterAI did not respond in time")
        return LLMUnavailable("LLM is unavailable")
    if isinstance(e, openai.APIConnectionError):
        logger.warning("RouterAI is unreachable")
        return LLMUnavailable("LLM is unavailable")
    if isinstance(e, openai.APIStatusError):
        if e.status_code == 402:
            logger.error("RouterAI responded with 402: the account balance is exhausted")
        else:
            logger.warning("RouterAI responded with %s", e.status_code)
        if e.status_code in _TRANSIENT_STATUSES or e.status_code >= 500:
            return LLMUnavailable("LLM is unavailable")
        return LLMError("LLM request failed")
    if isinstance(e, openai.APIError):
        logger.warning("RouterAI stream failed, code=%s", e.code)
        return LLMUnavailable("LLM is unavailable")
    logger.warning("RouterAI client failed: %s", type(e).__name__)
    return LLMError("LLM request failed")


class RouterAIProvider:
    def __init__(self, api_key: str, base_url: str, model: str) -> None:
        self._model = model
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=openai.Timeout(60, connect=5),
            max_retries=0,
        )

    async def close(self) -> None:
        await self._client.close()

    async def chat(
        self, messages: Sequence[ChatMessage], *, max_tokens: int, json_mode: bool = False
    ) -> str:
        started = time.perf_counter()
        usage: CompletionUsage | None = None
        try:
            response = await self._client.chat.completions.create(
                **self._params(messages, max_tokens),
                response_format={"type": "json_object"} if json_mode else openai.omit,
            )
            if not isinstance(response, ChatCompletion):
                raise ValueError("not a chat completion")
            usage = response.usage
        except (openai.OpenAIError, ValueError) as e:
            raise _translate(e) from e
        finally:
            self._log_usage(usage, started)
        choice = response.choices[0] if response.choices else None
        if choice is None or not choice.message.content:
            logger.warning("RouterAI returned an empty answer, finish_reason=%s", choice and choice.finish_reason)
            raise LLMError("LLM returned an empty answer")
        if choice.finish_reason in _CUT_REASONS:
            logger.warning("RouterAI answer was cut: %s", choice.finish_reason)
            if json_mode or choice.finish_reason == "content_filter":
                raise LLMError("LLM answer was cut")
        return choice.message.content

    async def stream(self, messages: Sequence[ChatMessage], *, max_tokens: int) -> AsyncIterator[str]:
        started = time.perf_counter()
        usage: CompletionUsage | None = None
        finish_reason = None
        produced = False
        try:
            response = await self._client.chat.completions.create(
                **self._params(messages, max_tokens),
                stream=True,
                stream_options={"include_usage": True},
            )
            async with response:
                async for chunk in response:
                    if chunk.usage:
                        usage = chunk.usage
                    if not chunk.choices:
                        continue
                    choice = chunk.choices[0]
                    finish_reason = choice.finish_reason or finish_reason
                    if choice.delta.content:
                        produced = True
                        yield choice.delta.content
        except (openai.OpenAIError, ValueError) as e:
            raise _translate(e) from e
        finally:
            self._log_usage(usage, started)
        if not produced:
            logger.warning("RouterAI returned an empty stream, finish_reason=%s", finish_reason)
            raise LLMError("LLM returned an empty answer")
        if finish_reason in _CUT_REASONS:
            logger.warning("RouterAI answer was cut: %s", finish_reason)

    def _params(self, messages: Sequence[ChatMessage], max_tokens: int) -> dict[str, Any]:
        return {
            "model": self._model,
            "messages": list(messages),
            "max_tokens": max_tokens,
            "extra_body": _NO_REASONING,
        }

    def _log_usage(self, usage: CompletionUsage | None, started: float) -> None:
        elapsed = time.perf_counter() - started
        if usage is None:
            logger.info("llm model=%s usage=unknown time=%.2fs", self._model, elapsed)
            return
        details = usage.completion_tokens_details
        logger.info(
            "llm model=%s prompt=%s completion=%s reasoning=%s time=%.2fs",
            self._model,
            usage.prompt_tokens,
            usage.completion_tokens,
            details.reasoning_tokens if details else None,
            elapsed,
        )
