# AI Interviews — agent instructions

## Start here

Read `memory/README.md`, `memory/project-state.md`, then the affected service's
README and AGENTS.md. Memory is dated context, not live state: verify code,
configuration and `git status` before editing. Architecture docs and ADRs include
planned features. A contract or mock does not prove backend implementation.

## Ownership and boundaries

- `services/core-api`: Java 21, Spring Boot, Maven Wrapper; users, JWT, interview
  lifecycle and final results; owns DB schema `core`.
- `services/ai-service`: Python 3.12, FastAPI, uv; dialogue, LLM, evaluations;
  owns schema `ai`.
- `services/web`: React, TypeScript, Vite; layers `app → pages → modules → shared`.
- `contracts/*.yaml`: API contracts. Update contracts, implementation and consumers
  together. `make api-gen` updates the committed frontend client.
- `infra/`: Compose, nginx, PostgreSQL initialization. `ml/` stays outside runtime.

Only core-api issues RS256 JWTs; AI verifies JWKS. Cross-service access uses
`/internal/*` with `INTERNAL_API_TOKEN`, never another service's DB schema.
Gateway preserves `/api/`, strips `/ai/`, blocks `/internal/`.

## Run and verify

From root: `make up`, `make ps`, `make logs`, `make down`.
Full command: `docker compose -f infra/docker-compose.yml --env-file .env …`.
Plain `docker compose up` cannot find the nested file from root.
Gateway: `http://localhost:80`; standalone Vite: 5173. Backend ports 8080/8000
are internal, not published to the host by standard Compose.

Match checks to the change; see service AGENTS.md. A build does not prove all
user flows. For infrastructure, check `config --quiet`, container state and HTTP
through gateway. Distinguish UI mocks, FakeProvider and real model responses.
`/ai/health` alone does not verify the external LLM.

## Configuration and data

- `.env` and `infra/secrets/` are local and ignored. Never dump full environment,
  `docker inspect` or expanded Compose output: they may expose secrets.
- Preserve user configuration; do not overwrite `.env` or silently select `fake`
  to make a check pass. Explicitly disclose test mode.
- `make jwt-keys` overwrites keys: check for an existing private key first.
- Env changes require container recreation (`up -d`), not `restart`. MTU changes
  require network recreation; see the runtime skill.
- `make down` preserves volumes. Do not use `down -v`, clear databases or delete
  interview plans as routine troubleshooting.

## Project skills

Read the relevant workflow when applicable:

- `.agents/skills/ai-interviews-runtime/SKILL.md`: builds, startup, Docker access,
  fake/RouterAI, network errors and verification.
- `.agents/skills/ai-interviews-api/SKILL.md`: coordinated Java/Python/React API
  changes, client generation, SSE and integration checks.

## Memory and completion

Update `memory/` for confirmed limitations, decisions or recurring failures.
Include verification date and source paths; replace stale conclusions. Do not
store secrets, user conversations or transient container state as durable facts.
Avoid duplicating whole READMEs.

Review the diff and staged files before committing. Commit only requested work;
exclude unrelated changes. Push only within the authorized task. If Git identity
is unset, explicit agent authorship is available without changing global config:
`git -c user.name=Codex -c user.email=codex@localhost commit …`.
Do not attribute agent work to the user without their chosen identity.
