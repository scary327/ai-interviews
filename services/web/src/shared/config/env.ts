/** Переменные окружения фронта. Все VITE_* описаны в .env.example */
export const env = {
    /** Работать на MSW-моках без запущенных бэкендов */
    apiMocks: import.meta.env.VITE_API_MOCKS === "true"
} as const;
