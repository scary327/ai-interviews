# Проверенное состояние AI Interviews

Проверено: 2026-11-16. Это снимок реализации; при расхождении проверяйте указанный код.

## Общий запуск

- `make up` из корня использует `infra/docker-compose.yml` и корневой `.env`,
  собирает три сервиса и запускает PostgreSQL и gateway. Точка входа — HTTP, порт 80.
  Java и Python доступны через `/api/` и `/ai/`; их порты 8080 и 8000 не опубликованы
  на хост в стандартном Compose. Vite на 5173 — отдельный режим разработки.
  Источники: [Makefile](../Makefile), [Compose](../infra/docker-compose.yml),
  [nginx](../infra/nginx/nginx.conf), [Vite](../services/web/vite.config.ts).
- Коммит `1d253ba` добавил недостающий Dockerfile `core-api`, `.dockerignore`,
  настройку MTU и инструкции запуска. Тогда проверены сборка, миграции, HTTP-ответы
  сервисов и короткий реальный запрос к модели. Это не проверка всего пользовательского сценария.
- `make jwt-keys` перезаписывает существующий приватный ключ. Не использовать его
  как безусловный шаг повторного запуска. `.env` и `infra/secrets/` исключены из Git.
- PostgreSQL хранится в volume `pgdata`; обычный `make down` сохраняет данные.
  Изменение паролей в `.env` не переинициализирует пользователей уже созданной БД:
  [init.sh](../infra/postgres/init.sh) выполняется при первичной инициализации.

## Реальный AI и тестовые ответы

- `LLM_PROVIDER=fake` возвращает «тема 1», «тема 2», шаблонные реплики и оценки.
  Это не качество реальной модели. `routerai` требует ключ. В Python значение
  провайдера по умолчанию — `fake`, в `.env.example` — `routerai`.
  Источники: [настройки](../services/ai-service/app/config.py),
  [FakeProvider](../services/ai-service/app/llm/fake.py),
  [фабрика](../services/ai-service/app/llm/factory.py).
- После правки `.env` сравнивайте выбранный провайдер с окружением работающего
  контейнера; `make up` применяет изменения посредством пересоздания. Не выводите
  полное окружение или `docker compose config` с секретами в чат.
- План хранится в БД и переиспользуется. Смена провайдера не заменяет вопросы
  существующего интервью; проверяйте новый диалог, сохраняя старые данные.
  Источник: [engine.py](../services/ai-service/app/services/engine.py).
- У фронта есть независимые MSW-моки (`VITE_API_MOCKS`), отдельно от Python `fake`.
  Успех сценария с моками не доказывает совместимость с backend.
  Источники: [env.ts](../services/web/src/shared/config/env.ts),
  [README web](../services/web/README.md).

## Тайм-ауты через VPN

На одной локальной установке TLS из Docker зависал: MTU Docker 1500 превышал MTU
VPN 1376. Проверка в сети с MTU 1280 и последующий запрос к модели прошли успешно.
Исправление: локальное `DOCKER_NETWORK_MTU=1280`; общее значение по умолчанию остаётся
1500. Для применения изменения сети — `make down` и `make up` без удаления volume.
Не применять этот диагноз ко всем ошибкам 503: сначала сопоставляйте логи, доступ
с хоста и из контейнера. Источники: [Compose](../infra/docker-compose.yml),
[обработка ошибок RouterAI](../services/ai-service/app/llm/routerai.py).

## Известные ограничения реализации

- Контракт и документация описывают refresh/logout, фронт вызывает
  `/api/auth/refresh`, но в текущем Java-коде реализованы только auth register/login.
  Следствие: восстановление сессии после перезагрузки страницы не следует считать
  рабочим. Это обнаруженное расхождение, а не исправленная функция.
  Источники: [контракт](../contracts/core-api.yaml),
  [AuthController](../services/core-api/src/main/java/tech/aiinterviews/core/auth/AuthController.java),
  [session.ts](../services/web/src/shared/api/session.ts).
- Во фронте есть Vitest-тесты; команды — в [package.json](../services/web/package.json).
  На дату проверки в `core-api` нет `src/test`, в `ai-service` нет каталога тестов и
  настроенного pytest в [pyproject.toml](../services/ai-service/pyproject.toml).
  Успешный Maven `package` не означает, что поведение backend покрыто тестами.
- [Архитектура](../docs/architecture.md) и [ADR](../docs/adr/) содержат целевые решения.
  Подтверждайте наличие эндпоинтов и функциональности по реализации и проверкам.
