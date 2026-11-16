# Frontend rules

- Layers: `app → pages → modules → shared`. Modules cannot import each other;
  external access goes through module `index.ts`. Pages receive route parameters
  and navigation from `app/routes`. See README.md and eslint.config.js.
- Server data belongs in TanStack Query; Jotai holds client state. Keep access
  tokens in memory; do not move them to localStorage to bypass auth failures.
- Change API through `../../contracts/*.yaml`, then `npm run api:gen`. Commit
  `src/shared/api/generated/`: web's Docker context excludes contracts.
  Import via `@/shared/api`; do not edit generated code manually.
- TanStack Router generates `src/app/routeTree.gen.ts`. Edit route source files,
  then run Vite/build.
- SSE uses POST + fetch (`src/shared/api/sse.ts`), with `delta`, `done`, `error`
  events. Preserve POST, auth and cancellation; EventSource is not a replacement.
- MSW (`VITE_API_MOCKS=true`) and Python `LLM_PROVIDER=fake` are separate modes.
  Mocked success does not verify backends. `VITE_*` are build-time values;
  root Compose `.env` does not automatically configure Vite.
- Dev server uses 5173 and proxies to host ports 8080/8000. Standard Compose
  does not publish these ports; access the full stack through HTTP gateway 80.

## Verification

From this directory: `npm ci`, then relevant checks: `npm run build`,
`npm run lint`, `npm test`. Target a regression with e.g.
`npm test -- src/shared/api/sse.test.ts`. MSW tests do not verify real APIs.

As of 2026-11-16, frontend calls `/api/auth/refresh`, but Java AuthController only
implements register/login. Verify server code when diagnosing session restoration;
the README's description of refresh does not prove implementation.
