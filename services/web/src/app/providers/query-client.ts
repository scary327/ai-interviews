import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

/** Ошибки 4xx повторять бессмысленно — ретраим только сеть и 5xx */
const shouldRetry = (failureCount: number, error: unknown) => {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status && status < 500) return false;
    return failureCount < 2;
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: shouldRetry,
            refetchOnWindowFocus: false
        },
        mutations: {
            retry: false
        }
    }
});
