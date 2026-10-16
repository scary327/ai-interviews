import { createFileRoute, useRouter } from "@tanstack/react-router";

import { LoginPage } from "@/pages/login/LoginPage";

interface LoginSearch {
    /** Куда вернуть после логина (ставит guard кабинета) */
    redirect?: string;
}

/** Только относительные пути внутри приложения — защита от open redirect */
const isSafeRedirect = (value: unknown): value is string =>
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

export const Route = createFileRoute("/_guest/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearch => ({
        redirect: isSafeRedirect(search.redirect) ? search.redirect : undefined
    }),
    component: LoginRoute
});

function LoginRoute() {
    const router = useRouter();
    const { redirect } = Route.useSearch();

    return <LoginPage onSuccess={() => router.history.push(redirect ?? "/dashboard")} />;
}
