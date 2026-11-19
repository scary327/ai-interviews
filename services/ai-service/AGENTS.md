# ai-service rules

- Python 3.12+, FastAPI, async SQLAlchemy; dependencies managed with `uv` and
  `uv.lock`. Update dependencies through uv and commit lock changes. Avoid heavy
  ML runtime dependencies unless required by the task.
- Only `app/llm/` calls provider SDKs. Other layers use
  `LLMProvider.complete_json/stream`. Prompts: `app/prompts/`; response schemas:
  `app/schemas/llm.py`.
- Verify RS256 JWT via core-api JWKS and interview ownership via internal API.
  Never issue JWTs or obtain private keys. Ownership mismatch returns 404.
- Own schema `ai` only. Model changes require Alembic migrations; preserve schema
  filtering in `migrations/env.py`. Access user/interview data and submit results
  via core-api through `app/clients/core_api.py`.
- Routes omit `/ai`: gateway/Vite strip it. SSE uses POST and `delta`, `done`,
  `error` events; after streaming starts, an HTTP status cannot replace an error event.
- Restore state from plans, messages and evaluations. Preserve per-interview
  advisory locks, incomplete-answer rollback and safe retry after failure.
  Repeated finish returns the saved result.
- Current flow: eight questions (older five-question plans run to their own length),
  at most one follow-up per question; engine controls
  transitions. Final report has four criteria and a half-up rounded average.
  Coordinate rule changes with schemas/contracts and check boundary behavior.
- `fake` produces canned questions/evaluations, not real model verification.
  Do not hide failures by switching configured RouterAI to fake. Existing plans
  persist across provider changes.

## Verification

From this directory: `uv sync --frozen`, then
`uv run python -m compileall -q app migrations` for syntax. As of 2026-11-16,
there is no test directory or pytest dependency; do not claim pytest passed.
Add targeted checks with a stub LLM for substantial logic changes, without network costs.

`uv run alembic upgrade head` requires configured environment/database and mutates
the DB. For Compose startup, check migrations and `GET http://localhost/ai/health`;
health does not verify the external LLM. Test a real model request separately when
within scope, without printing keys or full user conversations.
