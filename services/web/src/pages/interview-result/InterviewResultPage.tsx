import { Link } from "@tanstack/react-router";
import { RotateCcwIcon } from "lucide-react";

import { InterviewResultView, InterviewTranscript, LEVEL_LABELS } from "@/modules/interview";
import { useGetInterview } from "@/shared/api";
import { ErrorState } from "@/shared/components/ErrorState";
import { PageHeader } from "@/shared/components/PageHeader";
import { formatDate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export const InterviewResultPage = ({ interviewId }: { interviewId: string }) => {
    const { data: interview, isPending, error, refetch } = useGetInterview(interviewId);

    if (isPending) return <Skeleton className="h-96" />;
    if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

    return (
        <div className="space-y-8">
            <PageHeader
                title={interview.position}
                description={`${LEVEL_LABELS[interview.level]} · ${formatDate(interview.createdAt)}`}
                actions={
                    <Button variant="outline" asChild>
                        <Link to="/interviews/new">
                            <RotateCcwIcon /> Пройти ещё раз
                        </Link>
                    </Button>
                }
            />

            {interview.result ? (
                <InterviewResultView result={interview.result} />
            ) : (
                <p className="text-muted-foreground">Оценка ещё готовится…</p>
            )}

            <details className="group rounded-xl border p-4">
                <summary className="cursor-pointer font-medium">Переписка</summary>
                <div className="mt-4">
                    <InterviewTranscript interviewId={interviewId} />
                </div>
            </details>
        </div>
    );
};
