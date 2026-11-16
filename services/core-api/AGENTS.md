# core-api rules

- Java 21, Spring Boot, Maven Wrapper. Organize by feature (`auth`, `user`,
  `interview`, `internal`), then Controller → Service → Repository; separate DTOs
  from entities.
- Only this service issues RS256 JWTs. Publish public keys at
  `/api/.well-known/jwks.json`; AI receives JWKS, never the private key.
- Public controllers use `/api/...`; service endpoints use `/internal/...`.
  Do not add a global context-path: nginx preserves `/api` and blocks `/internal`.
- `/internal` uses `X-Internal-Token`, not user JWT authentication. For access
  changes, check both SecurityFilterChains and interview ownership.
- Own schema `core` only. Use agreed APIs for AI data, not schema `ai` tables.
  Add new Flyway migrations under `src/main/resources/db/migration/`;
  never rewrite applied migrations.
- Contracts: `../../contracts/core-api.yaml`, `../../contracts/internal.yaml`.
  Public API changes require aligned DTOs, OpenAPI and web client regeneration
  (`make api-gen` from root).
- Startup requires DB_URL/DB_USER/DB_PASSWORD, an existing JWT private key and
  INTERNAL_API_TOKEN. `make jwt-keys` overwrites keys; do not rerun for unrelated errors.

## Verification

From this directory with JDK 21: `sh mvnw -B verify`. Dockerfile runs wrapper
`package`; from root: `docker compose -f infra/docker-compose.yml --env-file .env build core-api`.

As of 2026-11-16, `src/test` is absent: successful builds do not imply tests ran.
Add targeted regression tests for business logic changes. For startup changes,
check migration logs and the JWKS HTTP response through gateway.

README includes intended structure. Current AuthController has register/login;
refresh is not implemented despite frontend usage. Verify before claiming session support.
