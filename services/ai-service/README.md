# ai-service

Python 3.12 + FastAPI. Диалог с LLM, оценка ответов.

## Запуск

Нужен [uv](https://docs.astral.sh/uv/).

```bash
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

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
| `LLM_PROVIDER` | `fake` (по умолчанию, без токена) \| `routerai` \| `local` |
| `ROUTERAI_API_KEY`, `ROUTERAI_MODEL` | доступ к RouterAI |
| `DB_URL` | Postgres, схема `ai` |
| `CORE_API_URL` | внутренний адрес core-api |
| `JWKS_URL` | откуда брать публичный ключ |
| `INTERNAL_API_TOKEN` | токен для вызова `/internal/*` |

API: [contracts/ai-service.yaml](../../contracts/ai-service.yaml)
