# contracts

OpenAPI-спеки — источник правды для API.

- [core-api.yaml](core-api.yaml) — публичное API Java-сервиса (`/api/*`)
- [ai-service.yaml](ai-service.yaml) — публичное API Python-сервиса (`/ai/*`)
- [internal.yaml](internal.yaml) — межсервисные эндпоинты (`/internal/*`, наружу не торчат)

Сначала меняем спеку, потом код. Фронт генерирует из спек хуки, типы и моки: `make api-gen` (Orval). У каждой операции должен быть `operationId` — из него получаются имена хуков.
