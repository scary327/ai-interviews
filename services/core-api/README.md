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

## Локальный запуск

Без приватного ключа JWT приложение не стартует. Ключ генерируется один раз,
из корня репозитория (`infra/secrets/` в `.gitignore`):

```bash
make jwt-keys
# или без make (Windows, Git Bash):
mkdir -p infra/secrets
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out infra/secrets/jwt_private.pem
```

Публичный ключ core-api вычисляет из приватного и отдаёт на
`/api/.well-known/jwks.json`, отдельный файл не нужен.

При запуске из IDE в переменных окружения указать:

```
DB_URL=jdbc:postgresql://localhost:5432/ai_interviews?currentSchema=core
DB_USER=core
DB_PASSWORD=core
JWT_PRIVATE_KEY_PATH=<абсолютный путь к репозиторию>/infra/secrets/jwt_private.pem
```

Postgres можно поднять отдельно: `docker compose -f infra/docker-compose.yml --env-file .env up -d postgres`.

API: [contracts/core-api.yaml](../../contracts/core-api.yaml)
