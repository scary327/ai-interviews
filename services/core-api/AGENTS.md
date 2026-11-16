# Правила core-api

- Java 21, Spring Boot, Maven Wrapper. Пакеты организованы по фичам (`auth`, `user`, `interview`, `internal`); внутри — Controller → Service → Repository, отдельные DTO и entity.
- Этот сервис единственный выдаёт JWT RS256. Публичный ключ публикуется на `/api/.well-known/jwks.json`; AI получает JWKS, а не приватный ключ.
- Публичные контроллеры используют `/api/...`, межсервисные — `/internal/...`. Не добавлять общий context-path: nginx сохраняет `/api`, а `/internal` наружу закрыт.
- Для `/internal` используется `X-Internal-Token`; не подменять проверкой пользовательского JWT. Изменяя доступ, проверить обе SecurityFilterChain и принадлежность интервью пользователю.
- Сервис владеет только схемой `core`. Данные AI получать по согласованным API, не через таблицы схемы `ai`. Изменения БД оформлять новыми Flyway-миграциями в `src/main/resources/db/migration/`; применённые миграции не переписывать.
- Контракты: `../../contracts/core-api.yaml` и `../../contracts/internal.yaml`. Изменения публичного API требуют согласования DTO, OpenAPI и генерации web-клиента (`make api-gen` из корня).
- Перед запуском нужны DB_URL/DB_USER/DB_PASSWORD, существующий приватный JWT-ключ и INTERNAL_API_TOKEN. `make jwt-keys` перезаписывает ключ: не запускать повторно для исправления несвязанной ошибки.

## Проверка изменений

Из этой папки с JDK 21: `sh mvnw -B verify`. Dockerfile использует wrapper и `package`; из корня сборка сервиса: `docker compose -f infra/docker-compose.yml --env-file .env build core-api`.

На 2026-11-16 `src/test` отсутствует: успешная Maven-сборка не означает, что выполнены тесты. Для изменений бизнес-логики добавлять целевой регрессионный тест; после изменения запуска проверять логи миграций и HTTP-ответ JWKS через gateway.

README описывает целевую структуру. В текущем AuthController есть register/login; refresh пока не реализован, хотя фронт его вызывает. Проверять код перед утверждениями о поддержке сессий.
