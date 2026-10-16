import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig
} from "axios";

import { getAccessToken, refreshSession } from "./session";

/**
 * HTTP-клиенты для двух бэкендов. Их использует сгенерированный Orval код (mutator),
 * руками дёргать не нужно — бери хуки из "@/shared/api".
 */

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const createHttp = (baseURL: string): AxiosInstance => {
    const instance = axios.create({ baseURL, withCredentials: true });

    instance.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    // 401 → один раз пробуем обновить токен и повторить запрос
    instance.interceptors.response.use(undefined, async (error: AxiosError) => {
        const config = error.config as RetriableConfig | undefined;
        const isAuthCall = config?.url?.startsWith("/auth/");

        if (error.response?.status !== 401 || !config || config._retried || isAuthCall) {
            throw error;
        }

        config._retried = true;
        const token = await refreshSession();
        if (!token) throw error;

        return instance(config);
    });

    return instance;
};

export const coreClient = createHttp("/api");
export const aiClient = createHttp("/ai");

const createMutator =
    (client: AxiosInstance) =>
    <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
        client({ ...config, ...options }).then(({ data }) => data as T);

/** Mutator для Orval: core-api */
export const coreHttp = createMutator(coreClient);
/** Mutator для Orval: ai-service */
export const aiHttp = createMutator(aiClient);

// Типы, которые Orval подставляет в сгенерированные хуки
export type ErrorType<E> = AxiosError<E>;
export type BodyType<B> = B;
