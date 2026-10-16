import { createFileRoute } from "@tanstack/react-router";

import { InterviewResultPage } from "@/pages/interview-result/InterviewResultPage";
import { getGetInterviewQueryOptions } from "@/shared/api";

export const Route = createFileRoute("/_app/interviews/$interviewId/result")({
    loader: ({ context, params }) =>
        context.queryClient.ensureQueryData(getGetInterviewQueryOptions(params.interviewId)),
    component: InterviewResultRoute
});

function InterviewResultRoute() {
    const { interviewId } = Route.useParams();
    return <InterviewResultPage interviewId={interviewId} />;
}
