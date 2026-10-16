import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { getListInterviewsQueryOptions } from "@/shared/api";

export const Route = createFileRoute("/_app/dashboard")({
    // Префетч: при наведении на ссылку данные уже начинают грузиться
    loader: ({ context }) => context.queryClient.prefetchQuery(getListInterviewsQueryOptions()),
    component: DashboardPage
});
