import type { LucideIcon } from "lucide-react";
import { CheckCheckIcon, ListIcon, TrophyIcon, TrendingUpIcon } from "lucide-react";

import { type Interview, useListInterviews } from "@/shared/api";
import { Card, CardAction, CardDescription, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

interface Stats {
    total: number;
    finished: number;
    averageScore: number | null;
    bestScore: number | null;
}

const toStats = (list: Interview[]): Stats => {
    const scores = list.flatMap((i) => (i.result ? [i.result.score] : []));

    return {
        total: list.length,
        finished: list.filter((i) => i.status === "FINISHED").length,
        averageScore: scores.length
            ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
            : null,
        bestScore: scores.length ? Math.max(...scores) : null
    };
};

const StatCard = ({
    label,
    value,
    icon: Icon
}: {
    label: string;
    value: string;
    icon: LucideIcon;
}) => (
    <Card size="sm">
        <CardHeader>
            <CardDescription>{label}</CardDescription>
            <div className="font-heading text-2xl font-semibold tabular-nums">{value}</div>
            <CardAction>
                <Icon className="size-4 text-muted-foreground" />
            </CardAction>
        </CardHeader>
    </Card>
);

const formatScore = (score: number | null) => (score === null ? "—" : `${score} / 100`);

export const InterviewStats = () => {
    const { data, isPending, error } = useListInterviews({ query: { select: toStats } });

    if (error) return null;

    if (isPending) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-20" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Всего собеседований" value={String(data.total)} icon={ListIcon} />
            <StatCard label="Завершено" value={String(data.finished)} icon={CheckCheckIcon} />
            <StatCard
                label="Средний балл"
                value={formatScore(data.averageScore)}
                icon={TrendingUpIcon}
            />
            <StatCard
                label="Лучший результат"
                value={formatScore(data.bestScore)}
                icon={TrophyIcon}
            />
        </div>
    );
};
