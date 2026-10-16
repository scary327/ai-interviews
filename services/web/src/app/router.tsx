import { createRouter } from "@tanstack/react-router";

import { ErrorState } from "@/shared/components/ErrorState";
import { FullPageSpinner } from "@/shared/components/FullPageSpinner";

import { queryClient } from "./providers/query-client";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
    routeTree,
    context: { queryClient },
    // Наводишь на ссылку — данные страницы уже грузятся (loader'ы + React Query)
    defaultPreload: "intent",
    // Кешем данных управляет React Query, у роутера свой кеш не нужен
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultPendingComponent: FullPageSpinner,
    defaultErrorComponent: ({ error, reset }) => (
        <ErrorState error={error} title="Ошибка на странице" onRetry={reset} />
    )
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
