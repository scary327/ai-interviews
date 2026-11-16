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

Для реальных собеседований заполните в `.env` `ROUTERAI_API_KEY` и
`ROUTERAI_MODEL`, оставив `LLM_PROVIDER=routerai`. Для проверки запуска без
внешнего API можно выбрать `LLM_PROVIDER=fake`: вопросы и оценки будут тестовыми.
После изменения `.env` выполните `make up`, чтобы пересоздать контейнеры.
После смены провайдера создайте новое собеседование: старое сохраняет свой план.

`make up` собирает все три сервиса и запускает их вместе с PostgreSQL и nginx.
Проверка контейнеров: `make ps`, логи: `make logs`, остановка: `make down`.
Файл Compose находится в `infra/`, поэтому команды запускайте через Makefile
из корня проекта.

Если через VPN запросы к модели зависают на TLS-соединении, задайте в `.env`
`DOCKER_NETWORK_MTU=1280` и пересоздайте сеть: `make down && make up`.
Обычный `make down` сохраняет данные PostgreSQL.

## Работа с AI-агентами

Начальная инструкция — [AGENTS.md](AGENTS.md), проверенные факты и ограничения —
[memory/](memory/README.md). В каждом сервисе есть свой `AGENTS.md`.
Навыки проекта: [диагностика запуска и LLM](.agents/skills/ai-interviews-runtime/SKILL.md)
и [изменение API между сервисами](.agents/skills/ai-interviews-api/SKILL.md).
Если инструмент не загружает AGENTS.md автоматически, укажите ему этот файл явно.
