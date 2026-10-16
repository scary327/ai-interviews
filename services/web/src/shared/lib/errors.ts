import { isAxiosError } from "axios";

/** Человекочитаемое сообщение из ошибки запроса (ProblemDetail / FastAPI detail / сеть) */
export const getErrorMessage = (error: unknown, fallback = "Что-то пошло не так") => {
    if (isAxiosError(error)) {
        const data = error.response?.data as { detail?: unknown; message?: unknown } | undefined;
        if (typeof data?.detail === "string") return data.detail;
        if (typeof data?.message === "string") return data.message;
        if (!error.response) return "Нет соединения с сервером";
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};
