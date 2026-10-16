import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/app/layouts/AppLayout";
import { ensureSession } from "@/shared/api";

/** Кабинет: только для залогиненных. Сессию восстанавливаем через refresh cookie */
export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ location }) => {
        if (!(await ensureSession())) {
            throw redirect({ to: "/login", search: { redirect: location.href } });
        }
    },
    component: AppLayout
});
