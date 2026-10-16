# web

Фронтенд AI Interviews: React 19 + TypeScript + Vite.

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # VITE_API_MOCKS=true — бэкенды не нужны
npm run dev                  # http://localhost:5173
```

С моками работает весь сценарий: регистрация → новое собеседование → чат со стримингом → завершение → результат. Логин принимает любые данные.

Чтобы работать с настоящими бэкендами, поставь `VITE_API_MOCKS=false`. Vite проксирует `/api` → `localhost:8080` (core-api) и `/ai` → `localhost:8000` (ai-service), см. [vite.config.ts](vite.config.ts).

## Команды

| Команда                     | Что делает                                        |
| --------------------------- | ------------------------------------------------- |
| `npm run dev`               | dev-сервер                                        |
| `npm run build`             | typecheck + prod-сборка                           |
| `npm run typecheck`         | только проверка типов                             |
| `npm run lint` / `lint:fix` | ESLint (в том числе границы слоёв)                |
| `npm run format`            | Prettier                                          |
| `npm test` / `test:watch`   | Vitest                                            |
| `npm run api:gen`           | перегенерировать API-клиент из `contracts/*.yaml` |

Pre-commit хук (husky + lint-staged) прогоняет ESLint и Prettier по изменённым файлам.

## Стек

| Задача               | Библиотека                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Роутинг              | [TanStack Router](https://tanstack.com/router): file-based, типизированные пути и search-параметры |
| Серверные данные     | [TanStack Query](https://tanstack.com/query) + хуки, сгенерированные [Orval](https://orval.dev)    |
| HTTP                 | axios (обёрнут в `shared/api/http.ts`)                                                             |
| Клиентское состояние | [Jotai](https://jotai.org) (атомы)                                                                 |
| UI                   | [shadcn/ui](https://ui.shadcn.com) (Radix) + Tailwind CSS v4 + lucide-иконки                       |
| Формы                | react-hook-form + zod                                                                              |
| Моки                 | MSW (dev и тесты)                                                                                  |
| Тесты                | Vitest + Testing Library                                                                           |

**Кто за что отвечает в состоянии.** Всё, что пришло с сервера (пользователь, собеседования, сообщения), лежит в React Query. В атомы Jotai кладём только клиентское состояние: access-токен, тему, черновики ответов. Данные с сервера в атомы не копируем.

## Архитектура

```
src/
├── app/                 # сборка приложения
│   ├── routes/          # file-based роуты TanStack Router (тонкие: guard, loader, связка со страницей)
│   ├── layouts/         # AppLayout (сайдбар), AuthLayout
│   ├── providers/       # QueryClient, Jotai, тема, тосты
│   ├── styles/          # Tailwind + токены shadcn
│   ├── router.tsx       # createRouter
│   └── routeTree.gen.ts # генерируется плагином, не редактировать
├── pages/               # страницы: собирают модули, ничего не знают о роутере
├── modules/             # доменные модули
│   ├── auth/
│   ├── interview/
│   └── profile/
├── shared/              # переиспользуемое, без доменной логики
│   ├── api/             # http-клиенты, сессия, SSE, Orval (generated/), моки
│   ├── ui/              # компоненты shadcn
│   ├── components/      # свои общие компоненты (PageHeader, Markdown, ErrorState…)
│   ├── hooks/
│   ├── lib/             # утилиты, тема, форматирование
│   └── config/          # env
└── test/                # setup и хелперы тестов
```

### Слои и правила импорта

```
app  →  pages  →  modules  →  shared
```

Импортировать можно только слои правее себя. ESLint (`no-restricted-imports` в [eslint.config.js](eslint.config.js)) проверяет:

1. **`shared` не знает о модулях.** Если код нужен двум модулям — переносим в `shared`.
2. **Модули не импортируют друг друга.** Внутри модуля импорты относительные (`../hooks/...`), снаружи модуль доступен только через `index.ts` (`@/modules/auth`).
3. **Страницы собирают модули.** Связать `auth` и `interview` — задача страницы.
4. **Страницы не знают о роутере.** Параметры и навигация приходят пропсами из `app/routes`. Ссылки (`<Link to="...">`) использовать можно: они типизированы.
5. **Сгенерированный код берём только через `@/shared/api`**, не из `generated/`.

### Модуль

Внутри модуля обязательных папок нет, создаём только нужные:

```
modules/interview/
├── components/   # UI модуля
├── hooks/        # логика (useInterviewChat, SSE)
├── model/        # zod-схемы, типы
├── store/        # атомы Jotai
├── constants.ts
└── index.ts      # публичное API — всё, что видно снаружи
```

### Роуты

Файлы в `app/routes` превращаются в URL:

| Файл                                      | URL                      | Что делает                                            |
| ----------------------------------------- | ------------------------ | ----------------------------------------------------- |
| `index.tsx`                               | `/`                      | лендинг                                               |
| `_guest.tsx`                              | —                        | лейаут для гостей, залогиненного редиректит в кабинет |
| `_guest/login.tsx`, `register.tsx`        | `/login`, `/register`    |                                                       |
| `_app.tsx`                                | —                        | guard кабинета + AppLayout                            |
| `_app/dashboard.tsx`                      | `/dashboard`             |                                                       |
| `_app/interviews/index.tsx`               | `/interviews?status=`    | история, фильтр в URL                                 |
| `_app/interviews/new.tsx`                 | `/interviews/new`        |                                                       |
| `_app/interviews/$interviewId/index.tsx`  | `/interviews/:id`        | комната; завершённое редиректит на результат          |
| `_app/interviews/$interviewId/result.tsx` | `/interviews/:id/result` |                                                       |
| `_app/profile.tsx`                        | `/profile`               |                                                       |

`_` в начале имени — layout-роут без своего сегмента в URL.

## API

Клиент генерируется из [contracts/](../../contracts) с помощью Orval:

```bash
npm run api:gen
```

Получаем хуки (`useLogin`, `useListInterviews`, `useGetInterview`…), функции `get*QueryOptions` и `get*QueryKey` для loader'ов и инвалидации, а также типы и MSW-моки на faker. Сгенерированный код коммитится: Docker-сборка фронта не видит папку `contracts`.

**Авторизация.** Access-токен хранится в памяти (атом), refresh — в httpOnly cookie. При 401 axios один раз делает refresh и повторяет запрос; параллельные 401 склеиваются в один refresh. После F5 guard `_app` восстанавливает сессию через refresh ([shared/api/session.ts](src/shared/api/session.ts)).

**Стриминг.** Ответ интервьюера приходит по SSE через `POST`. `EventSource` так не умеет, поэтому используем `fetch` и свой парсер ([shared/api/sse.ts](src/shared/api/sse.ts)).

## Рецепты

**Новый эндпоинт.** Описать его в `contracts/*.yaml` (с `operationId`), выполнить `npm run api:gen` и взять хук из `@/shared/api`. Если нужна логика с состоянием — добавить хендлер в [shared/api/mocks/handlers.ts](src/shared/api/mocks/handlers.ts).

**Новая страница.** Создать компонент `pages/<name>/<Name>Page.tsx` и файл роута в `app/routes/...`. Дерево роутов перегенерируется само при `npm run dev`.

**Новый компонент shadcn.** `npx shadcn@latest add <name>` положит его в `shared/ui`.

**Тёмная тема.** Используй токены (`bg-background`, `text-muted-foreground`…) вместо конкретных цветов, тогда тема работает сама.
