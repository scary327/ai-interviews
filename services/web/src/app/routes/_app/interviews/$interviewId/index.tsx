import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { InterviewRoomPage } from "@/pages/interview-room/InterviewRoomPage";
import { getGetInterviewQueryOptions, getListMessagesQueryOptions } from "@/shared/api";

export const Route = createFileRoute("/_app/interviews/$interviewId/")({
    loader: async ({ context: { queryClient }, params }) => {
        const { interviewId } = params;
        void queryClient.prefetchQuery(getListMessagesQueryOptions(interviewId));
        const interview = await queryClient.ensureQueryData(
            getGetInterviewQueryOptions(interviewId)
        );
        // Завершённое собеседование продолжить нельзя, сразу к результату
        if (interview.status === "FINISHED") {
            throw redirect({ to: "/interviews/$interviewId/result", params });
        }
    },
    component: InterviewRoomRoute
});

function InterviewRoomRoute() {
    const { interviewId } = Route.useParams();
    const navigate = useNavigate();

    return (
        <InterviewRoomPage
            interviewId={interviewId}
            onFinished={() =>
                void navigate({ to: "/interviews/$interviewId/result", params: { interviewId } })
            }
        />
    );
}
