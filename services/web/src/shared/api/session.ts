import axios from "axios";
import { atom, createStore } from "jotai";

/**
 * Сессия пользователя.
 * access-токен живёт только в памяти (атом), refresh-токен — в httpOnly cookie,
 * его JS не видит. После перезагрузки страницы сессия восстанавливается через refresh.
 */

/** Единый jotai-store: нужен, чтобы читать атомы вне React (axios-интерцепторы, guard'ы роутера) */
export const appStore = createStore();

export const accessTokenAtom = atom<string | null>(null);
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null);

export const getAccessToken = () => appStore.get(accessTokenAtom);
export const setAccessToken = (token: string | null) => appStore.set(accessTokenAtom, token);

interface TokenResponse {
    accessToken: string;
}

let refreshing: Promise<string | null> | null = null;

/**
 * Обновить access-токен по refresh cookie.
 * Параллельные вызовы склеиваются в один запрос (несколько 401 одновременно → один refresh).
 */
export const refreshSession = (): Promise<string | null> => {
    refreshing ??= axios
        .post<TokenResponse>("/api/auth/refresh", null, { withCredentials: true })
        .then(({ data }) => {
            setAccessToken(data.accessToken);
            return data.accessToken;
        })
        .catch(() => {
            setAccessToken(null);
            return null;
        })
        .finally(() => {
            refreshing = null;
        });

    return refreshing;
};

/** Есть ли сессия. Если токена в памяти нет — пробуем refresh */
export const ensureSession = async (): Promise<boolean> => {
    if (getAccessToken()) return true;
    return (await refreshSession()) !== null;
};
