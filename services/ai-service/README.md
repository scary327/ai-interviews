# ai-service

Python 3.12 + FastAPI. Диалог с LLM, оценка ответов.

## Запуск

Нужен [uv](https://docs.astral.sh/uv/).

Сервису нужны Postgres (схема `ai`) и запущенный core-api — от него JWKS для проверки токенов и
`/internal` для данных собеседований. Переменные (см. «Конфигурация») задаются окружением или файлом
`.env` в папке сервиса (`services/ai-service/.env`, в git не попадает). Без `DB_URL`, `JWKS_URL` и
`INTERNAL_API_TOKEN` не стартуют ни сервис, ни миграции. Пример для локального запуска:

```
DB_URL=postgresql+asyncpg://ai:<пароль ai>@localhost:5432/ai_interviews
JWKS_URL=http://localhost:8080/api/.well-known/jwks.json
CORE_API_URL=http://localhost:8080
INTERNAL_API_TOKEN=<тот же, что у core-api>
LLM_PROVIDER=routerai
ROUTERAI_API_KEY=<ключ RouterAI>
```

`LLM_PROVIDER=routerai` без ключа сервис не запускает; без сети и ключа — `LLM_PROVIDER=fake`.
Каждый вызов модели пишет в лог строку расхода: модель, токены, время.

```bash
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

Новая миграция: поменять модели в `app/db/models.py`, затем
`uv run alembic revision --autogenerate -m "<что меняем>"` и проверить сгенерированный файл.
Автогенерацию запускать только под ролью `ai` (её схема по умолчанию — `ai`): под другой ролью в
сравнение попадут чужие схемы.
В Docker миграции применяются при старте контейнера.

- http://localhost:8000/health — healthcheck
- http://localhost:8000/docs — Swagger UI

Префикса `/ai` в роутах нет: его срезают nginx и dev-прокси Vite.

Новая зависимость: `uv add <package>` (обновит `pyproject.toml` и `uv.lock`).

## Целевая структура

```
ai-service/
├── app/
│   ├── main.py              # создание FastAPI-приложения
│   ├── config.py            # pydantic-settings, LLM_PROVIDER и т.д.
│   ├── auth.py              # проверка JWT по JWKS из core-api
│   ├── api/                 # роуты (тонкий слой)
│   │   ├── interviews.py    # POST /interviews/{id}/messages (SSE), /finish
│   │   └── health.py
│   ├── llm/                 # всё, что касается модели
│   │   ├── base.py          # Protocol LLMProvider: chat(), stream()
│   │   ├── routerai.py      # реализация через RouterAI
│   │   ├── fake.py          # без сети: для разработки и проверок
│   │   ├── errors.py        # LLMError, LLMUnavailable — наружу не выходят исключения SDK
│   │   ├── local.py         # позже: своя модель
│   │   └── factory.py       # выбор провайдера по LLM_PROVIDER
│   ├── prompts/             # промпты — файлами, не строками в коде
│   │   ├── interviewer.md
│   │   └── evaluator.md
│   ├── services/            # логика собеса: ход диалога, оценка
│   ├── clients/             # HTTP-клиент к core-api (/internal/*)
│   ├── db/                  # модели SQLAlchemy, сессия
│   └── schemas/             # pydantic-модели запросов и ответов
├── migrations/              # Alembic
├── tests/
├── pyproject.toml
└── Dockerfile
```

**Правило:** кроме `app/llm/`, никакой код не импортирует SDK провайдера
напрямую. См. [ADR 0003](../../docs/adr/0003-llm-provider-abstraction.md).

## Конфигурация

| Переменная | Назначение |
|---|---|
| `LLM_PROVIDER` | `fake` (по умолчанию, без сети и ключа) \| `routerai`; своя модель (`local`) — позже, ADR 0003 |
| `ROUTERAI_API_KEY` | ключ RouterAI; обязателен при `LLM_PROVIDER=routerai` |
| `ROUTERAI_MODEL` | по умолчанию `deepseek/deepseek-v4.1-flash`; модель должна поддерживать отключение рассуждения (`reasoning.enabled=false`) |
| `ROUTERAI_BASE_URL` | по умолчанию `https://routerai.ru/api/v1` |
| `DB_URL` | обязательная; Postgres, `postgresql+asyncpg://…`, схема `ai` |
| `CORE_API_URL` | внутренний адрес core-api, по умолчанию `http://localhost:8080` |
| `JWKS_URL` | обязательная; откуда брать публичный ключ |
| `INTERNAL_API_TOKEN` | обязательная; токен для вызова `/internal/*` |

API: [contracts/ai-service.yaml](../../contracts/ai-service.yaml)
