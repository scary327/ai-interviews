---
name: ai-interviews-runtime
description: Run and troubleshoot AI Interviews Docker builds, RouterAI, test responses, Docker permissions and VPN networking. Use for startup or model availability issues in this project.
---

# AI Interviews runtime diagnosis

Work in the intended checkout root. Read AGENTS.md and memory/project-state.md.
Paths below are root-relative; do not assume a fixed machine path.

## Identify the failing layer

Check `git status --short`, `make ps`, Compose `logs --tail 80 <service>` and
`config --quiet`. Compose prefix:
`docker compose -f infra/docker-compose.yml --env-file .env`.
Limit log output; never publish keys, tokens or interview transcripts.

- `command not found`: inspect PATH and terminal environment. Flatpak VS Code may
  not see host Docker; `flatpak-spawn --host bash` applies to that environment only.
- Socket `permission denied`: compare `id`, docker group and socket permissions.
  If membership already exists, use `newgrp docker` or a new login session.
  Do not chmod the socket to 666 or grant unnecessary access.
- Missing `.env`: copy the example only if absent. Generate JWT keys only when
  the private key is absent. Preserve existing configuration.
- Browser SSL error on port 80: try explicit `http://127.0.0.1`, not HTTPS.

## Canned questions or model errors

Compare `LLM_PROVIDER` in `.env` with the running container. Print only API-key
presence, never its value. Container Python: `/app/.venv/bin/python`.
`FakeProvider` emits numbered topics and canned scores; it is not a real LLM.
Check frontend `VITE_API_MOCKS` separately; Vite values are fixed at build time.

After env changes, recreate AI with `up -d --no-deps ai-service`; rebuild for code
changes. Interview plans persist in DB. Test provider changes with a new interview;
do not delete existing plans.

The UI's temporary-model-unavailability message covers several causes. Inspect
`app/llm/routerai.py` and logs: timeout, connection errors, 402 (balance), 429 and
5xx need different responses. Do not change keys/models at random. Current client
limits: connect 5 seconds, overall timeout 60, retries 0; recheck code before
changing them. Failure around 5 seconds suggests checking connection establishment.

## TLS and VPN

Compare the same unauthenticated GET `https://routerai.ru/api/v1/models` from host
and container; an HTTP response distinguishes reachability from timeout.
If host succeeds but container TLS stalls, inspect routing and VPN/Docker MTU.
Lower MTU previously resolved this project's local issue, not all possible timeouts.
If needed, test a temporary Docker network at MTU 1280 and remove only resources
created for that check.

Confirmed local workaround: `.env` `DOCKER_NETWORK_MTU=1280`, then `make down`
and `make up`, without `-v`. Shared default stays 1500. Network recreation
interrupts requests; account for active work.

## Verify the result

Check container state and HTTP gateway routes `/`, `/api/.well-known/jwks.json`,
`/ai/health`. Allow startup time for migrations. For LLM failures, when authorized,
make one short request to the configured model; it may consume account balance.
Do not send user conversations as test input. Report actual failures rather than
masking them with fake mode. Record dated findings and sources in memory/,
without secrets or verbose logs.
