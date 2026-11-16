---
name: ai-interviews-api
description: Coordinate AI Interviews API changes across OpenAPI, Spring Boot, FastAPI and React. Use for endpoints, DTOs, authentication or SSE protocol changes in this project.
---

# AI Interviews API changes

Read root AGENTS.md, affected service rules and memory/project-state.md.
Paths below are relative to project root, not a fixed checkout.

1. Locate the operation in `contracts/core-api.yaml`, `contracts/ai-service.yaml`
   or `contracts/internal.yaml`, its controller/router and consumer. Verify actual
   implementation: refresh/logout in contracts or mocks does not prove Java support.
2. Preserve ownership: core-api owns JWT, users and interview status/results;
   ai-service owns dialogue, plans and answer evaluations. Cross-schema access
   goes through internal API. Knowing an interview ID does not prove ownership.
3. Coordinate contracts, stable `operationId`, DTO validation, error handling and
   callers. Gateway preserves `/api/`, strips `/ai/`, blocks external `/internal/`.
   Do not add a global Java context-path.
4. Add the next Flyway/Alembic migration for DB changes. Never rewrite applied
   migrations or clear volumes to make checks pass.
5. Run root `make api-gen` for public contract changes. Orval config lives in
   `services/web/orval.config.ts`; commit generated output, never hand-edit it.
   `internal.yaml` is not generated for browsers. Update manual MSW handlers and
   `shared/api` exports where needed.
6. For POST SSE, check the fetch parser `services/web/src/shared/api/sse.ts` and
   Python `app/services/engine.py`: delta/done/error events, cancellation, errors
   before and after streaming starts. JSON hooks or EventSource do not replace
   this protocol. Preserve advisory locks and incomplete-turn cleanup.
7. Run relevant service checks. For integration changes, verify the affected path
   through gateway: ownership, expected errors, persistence and retries. Mocks
   verify UI behavior, not backend readiness. Do not report a Maven build as tests
   when no tests exist.

Record newly confirmed contract/implementation gaps with source paths in
memory/project-state.md. Do not automatically expand the task to unrelated gaps.
