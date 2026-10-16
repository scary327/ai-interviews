import { Link } from "@tanstack/react-router";
import { MessagesSquareIcon } from "lucide-react";

import { ErrorState } from "@/shared/components/ErrorState";
import { type InterviewStatus, useListInterviews } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/shared/ui/empty";
import { Skeleton } from "@/shared/ui/skeleton";

import { InterviewCard } from "./InterviewCard";

interface InterviewListProps {
    /** Фильтр по статусу, без него — все */
    status?: InterviewStatus;
    /** Показать только первые N */
    limit?: number;
}

export const InterviewList = ({ status, limit }: InterviewListProps) => {
    const { data, isPending, error, refetch } = useListInterviews({
        query: {
            select: (list) =>
                list.filter((i) => !status || i.status === status).slice(0, limit ?? list.length)
        }
    });

    if (isPending) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
        );
    }

    if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

    if (data.length === 0) {
        return (
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MessagesSquareIcon />
                    </EmptyMedia>
                    <EmptyTitle>Собеседований пока нет</EmptyTitle>
                    <EmptyDescription>Начните первое — это займёт пару минут</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button asChild>
                        <Link to="/interviews/new">Новое собеседование</Link>
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
            ))}
        </div>
    );
};
