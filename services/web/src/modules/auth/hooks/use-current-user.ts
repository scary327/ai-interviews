import { useAtomValue } from "jotai";

import { isAuthenticatedAtom, useGetMe } from "@/shared/api";

/** Текущий пользователь. Запрос уходит только при наличии сессии */
export const useCurrentUser = () => {
    const isAuthenticated = useAtomValue(isAuthenticatedAtom);
    return useGetMe({ query: { enabled: isAuthenticated, staleTime: 5 * 60_000 } });
};
