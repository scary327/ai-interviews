import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Provider as JotaiProvider } from "jotai";
import type { ReactElement, ReactNode } from "react";

/**
 * render с провайдерами приложения: свежий QueryClient и jotai-store на каждый тест,
 * чтобы тесты не делили кеш и состояние.
 */
export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
    });
    const store = createStore();

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <JotaiProvider store={store}>{children}</JotaiProvider>
        </QueryClientProvider>
    );

    return {
        user: userEvent.setup(),
        queryClient,
        store,
        ...render(ui, { wrapper: Wrapper, ...options })
    };
};
