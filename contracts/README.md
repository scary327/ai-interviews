# contracts

OpenAPI-спеки — источник правды для API.

- [core-api.yaml](core-api.yaml) — публичное API Java-сервиса (`/api/*`)
- [ai-service.yaml](ai-service.yaml) — публичное API Python-сервиса (`/ai/*`)
- [internal.yaml](internal.yaml) — межсервисные эндпоинты (`/internal/*`, наружу не торчат)

Сначала меняем спеку, потом код. Фронт генерирует типы через `make gen-types`.
