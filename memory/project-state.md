# Verified AI Interviews state

Verified: 2026-11-16. Implementation snapshot; recheck linked code when it changes.

## Full-stack startup

- Root `make up` uses `infra/docker-compose.yml` and root `.env`, builds three
  services and starts PostgreSQL and gateway. Entry point: HTTP port 80.
  Java/Python are routed via `/api/` and `/ai/`; ports 8080/8000 are not published
  to the host in standard Compose. Vite on 5173 is a separate development mode.
  Sources: [Makefile](../Makefile), [Compose](../infra/docker-compose.yml),
  [nginx](../infra/nginx/nginx.conf), [Vite](../services/web/vite.config.ts).
- Commit `1d253ba` added the missing core-api Dockerfile, `.dockerignore`, MTU
  configuration and startup instructions. Build, migrations, service HTTP
  responses and one short real model request were verified then; this was not
  a complete user-flow test.
- `make jwt-keys` overwrites the private key; do not run it unconditionally on
  restart. `.env` and `infra/secrets/` are ignored by Git.
- PostgreSQL uses volume `pgdata`; ordinary `make down` preserves data. Changing
  passwords in `.env` does not update existing DB users:
  [init.sh](../infra/postgres/init.sh) runs during initial database creation.

## Real AI versus test responses

- `LLM_PROVIDER=fake` produces numbered topics, canned replies and evaluations.
  This says nothing about real model quality. `routerai` requires a key.
  Python defaults to `fake`; `.env.example` selects `routerai`.
  Sources: [settings](../services/ai-service/app/config.py),
  [FakeProvider](../services/ai-service/app/llm/fake.py),
  [factory](../services/ai-service/app/llm/factory.py).
- After editing `.env`, compare provider selection with the running container.
  `make up` applies changes by recreation. Do not print complete environment
  or expanded `docker compose config` containing secrets.
- Interview plans persist and are reused. Switching provider does not replace
  an existing interview's questions. Test a new interview; preserve old data.
  Source: [engine.py](../services/ai-service/app/services/engine.py).
- Frontend MSW mocks (`VITE_API_MOCKS`) are separate from Python `fake`.
  A successful mocked flow does not prove backend compatibility.
  Sources: [env.ts](../services/web/src/shared/config/env.ts),
  [web README](../services/web/README.md).

## VPN timeouts

One local installation stalled during TLS from Docker: Docker MTU 1500 exceeded
VPN MTU 1376. A network test at MTU 1280 and a subsequent real model request
succeeded. Local workaround: `DOCKER_NETWORK_MTU=1280`; shared default stays
1500. Apply with `make down` then `make up`, preserving the volume.
Do not assume every 503 has this cause: compare logs and host/container access.
Sources: [Compose](../infra/docker-compose.yml),
[RouterAI errors](../services/ai-service/app/llm/routerai.py).

## Known implementation gaps

- Contract/docs describe refresh/logout, and frontend calls `/api/auth/refresh`,
  but Java currently implements only auth register/login. Session restoration
  after page reload must not be assumed functional. This gap is not fixed.
  Sources: [contract](../contracts/core-api.yaml),
  [AuthController](../services/core-api/src/main/java/tech/aiinterviews/core/auth/AuthController.java),
  [session.ts](../services/web/src/shared/api/session.ts).
- Frontend has Vitest tests; see [package.json](../services/web/package.json).
  At verification, core-api had no `src/test`; ai-service had no test directory
  or pytest configuration in [pyproject.toml](../services/ai-service/pyproject.toml).
  Successful Maven `package` does not imply backend behavioral test coverage.
- [Architecture](../docs/architecture.md) and [ADRs](../docs/adr/) include intended
  capabilities. Confirm endpoint availability in implementation and runtime checks.
