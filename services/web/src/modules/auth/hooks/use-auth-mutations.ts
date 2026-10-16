import { useQueryClient } from "@tanstack/react-query";

import { setAccessToken, type TokenResponse, useLogin, useLogout, useRegister } from "@/shared/api";

/**
 * Обёртки над сгенерированными мутациями: кладут токен в сессию / чистят её.
 * Компоненты используют их, а не useLogin/useRegister напрямую.
 */

const onToken = ({ accessToken }: TokenResponse) => setAccessToken(accessToken);

export const useSignIn = () => useLogin({ mutation: { onSuccess: onToken } });

export const useSignUp = () => useRegister({ mutation: { onSuccess: onToken } });

export const useSignOut = () => {
    const queryClient = useQueryClient();

    return useLogout({
        mutation: {
            // Выходим локально даже если запрос упал — токен в памяти всё равно бесполезен
            onSettled: () => {
                setAccessToken(null);
                queryClient.clear();
            }
        }
    });
};
