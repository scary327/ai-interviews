import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ensureSession } from "@/shared/api";

/** Страницы для неавторизованных: залогиненного уводим в кабинет */
export const Route = createFileRoute("/_guest")({
    beforeLoad: async () => {
        if (await ensureSession()) throw redirect({ to: "/dashboard" });
    },
    component: AuthLayout
});
