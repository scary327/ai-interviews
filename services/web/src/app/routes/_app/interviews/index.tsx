import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { InterviewsPage } from "@/pages/interviews/InterviewsPage";
import { getListInterviewsQueryOptions } from "@/shared/api";

interface InterviewsSearch {
    status?: "IN_PROGRESS" | "FINISHED";
}

/** Фильтр живёт в URL (?status=FINISHED): им можно поделиться, он переживает F5 */
export const Route = createFileRoute("/_app/interviews/")({
    validateSearch: (search: Record<string, unknown>): InterviewsSearch => ({
        status:
            search.status === "IN_PROGRESS" || search.status === "FINISHED"
                ? search.status
                : undefined
    }),
    loader: ({ context }) => context.queryClient.prefetchQuery(getListInterviewsQueryOptions()),
    component: InterviewsRoute
});

function InterviewsRoute() {
    const { status } = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    return (
        <InterviewsPage
            filter={status ?? "all"}
            onFilterChange={(filter) =>
                void navigate({ search: { status: filter === "all" ? undefined : filter } })
            }
        />
    );
}
