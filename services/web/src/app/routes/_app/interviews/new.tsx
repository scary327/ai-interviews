import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { NewInterviewPage } from "@/pages/interview-new/NewInterviewPage";

export const Route = createFileRoute("/_app/interviews/new")({
    component: NewInterviewRoute
});

function NewInterviewRoute() {
    const navigate = useNavigate();

    return (
        <NewInterviewPage
            onCreated={({ id }) =>
                void navigate({ to: "/interviews/$interviewId", params: { interviewId: id } })
            }
        />
    );
}
