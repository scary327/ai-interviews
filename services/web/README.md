# web

React + TypeScript (Vite). SSR не нужен: бэкенды отдельные, страницы закрыты
логином. Если понадобятся публичные SEO-страницы, можно перейти на Next.

## Целевая структура

```
web/
├── src/
│   ├── app/                 # точка входа, роутер, провайдеры (query, auth)
│   ├── pages/               # страницы: собираются из features
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── interview/
│   ├── features/            # фичи с логикой
│   │   ├── auth/            # формы, хранение токена, refresh
│   │   └── interview/       # чат, чтение SSE-стрима, результат
│   └── shared/
│       ├── api/
│       │   ├── generated/   # типы из contracts/ (не редактировать руками)
│       │   ├── core.ts      # клиент /api
│       │   └── ai.ts        # клиент /ai
│       ├── ui/              # кнопки, инпуты и т.п.
│       └── lib/
├── public/
├── package.json
└── Dockerfile               # сборка → статика в nginx
```

Импорты направлены строго вниз: `pages → features → shared`. Фичи не
импортируют друг друга.

## Работа с API

- Базовые пути относительные: `/api` и `/ai`. В dev их проксирует Vite, в
  prod — nginx.
- Типы генерируются командой `make gen-types` (openapi-typescript).
