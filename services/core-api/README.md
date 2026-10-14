# core-api

Java 21 + Spring Boot. Авторизация, пользователи, собеседования.

## Целевая структура

Пакеты делятся по фичам, а не по слоям: каждая фича живёт в своей папке,
поэтому при параллельной работе меньше конфликтов.

```
core-api/
├── src/main/java/tech/aiinterviews/core/
│   ├── CoreApiApplication.java
│   ├── auth/            # login, register, refresh, JWT (RS256), JWKS endpoint
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── jwt/
│   │   └── dto/
│   ├── user/            # профиль пользователя
│   ├── interview/       # создание интервью, статусы, история
│   ├── internal/        # /internal/* — эндпоинты для ai-service
│   ├── common/          # ошибки (ProblemDetail), утилиты
│   └── config/          # SecurityConfig, CORS, бины
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/    # Flyway: V1__init.sql, ...
├── src/test/java/...
├── pom.xml
└── Dockerfile
```

Внутри фичи слои такие: `Controller → Service → Repository`, плюс `dto/` и
`entity`. DTO и entity не смешиваются.

Пути: публичные контроллеры маппятся на `/api/...`, внутренние — на
`/internal/...`. `context-path` не задаём: nginx передаёт `/api/*` как есть,
без обрезки префикса.

## Конфигурация

| Переменная | Назначение |
|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Postgres, схема `core` |
| `JWT_PRIVATE_KEY_PATH` | приватный ключ RS256 |
| `JWT_ACCESS_TTL` | время жизни access-токена |
| `INTERNAL_API_TOKEN` | токен для вызовов от ai-service |

API: [contracts/core-api.yaml](../../contracts/core-api.yaml)
