import { FinishInterviewButton, InterviewChat, LEVEL_LABELS } from "@/modules/interview";
import { useGetInterview } from "@/shared/api";
import { PageHeader } from "@/shared/components/PageHeader";
import { Skeleton } from "@/shared/ui/skeleton";

interface InterviewRoomPageProps {
    interviewId: string;
    onFinished: () => void;
}

/** Комната собеседования: занимает всю высоту, скроллится только лента сообщений */
export const InterviewRoomPage = ({ interviewId, onFinished }: InterviewRoomPageProps) => {
    const { data: interview } = useGetInterview(interviewId);

    return (
        <div className="flex h-full min-h-0 flex-col gap-2">
            {interview ? (
                <PageHeader
                    title={interview.position}
                    description={`${LEVEL_LABELS[interview.level]}${
                        interview.topics?.length ? ` · ${interview.topics.join(", ")}` : ""
                    }`}
                    actions={
                        <FinishInterviewButton interviewId={interviewId} onFinished={onFinished} />
                    }
                />
            ) : (
                <Skeleton className="h-14" />
            )}
            <InterviewChat interviewId={interviewId} />
        </div>
    );
};
