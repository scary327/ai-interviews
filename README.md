# AI Interviews

Платформа для прохождения тренировочных собеседований с нейросетью.

## Состав

| Сервис | Стек | Зона ответственности |
|---|---|---|
| [services/web](services/web) | React (Vite) | UI: авторизация, чат-собеседование, история |
| [services/core-api](services/core-api) | Java, Spring Boot | Авторизация (выдача JWT), пользователи, собеседования, результаты |
| [services/ai-service](services/ai-service) | Python, FastAPI | Диалог с LLM, оценка ответов, промпты |
| [ml](ml) | Python | (позже) датасеты и дообучение своей модели |

Подробно — в [docs/architecture.md](docs/architecture.md).

## Структура репозитория

```
ai-interviews/
├── services/
│   ├── web/              # фронтенд
│   ├── core-api/         # Java-бэкенд
│   └── ai-service/       # Python-бэкенд (LLM)
├── contracts/            # OpenAPI-спеки — источник правды для API
├── infra/                # docker-compose, nginx, init-скрипты БД
├── ml/                   # обучение моделей (отдельно от сервинга)
├── docs/                 # архитектура и ADR
├── .env.example
└── Makefile
```

## Быстрый старт

```bash
cp .env.example .env
make jwt-keys    # ключи для подписи JWT (один раз)
make up          # поднимает всё через docker compose
```

После запуска:
- http://localhost — приложение (через nginx)
- http://localhost/api — core-api
- http://localhost/ai — ai-service

> Сервисы пока не инициализированы — `make up` заработает, когда в каждом
> сервисе появится `Dockerfile`.
