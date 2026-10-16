import { CircleCheckIcon, CircleAlertIcon } from "lucide-react";

import type { InterviewResult } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

const scoreTone = (score: number) =>
    score >= 75
        ? "text-emerald-600 dark:text-emerald-400"
        : score >= 50
          ? "text-amber-600 dark:text-amber-400"
          : "text-destructive";

const PointsCard = ({
    title,
    items,
    positive
}: {
    title: string;
    items: string[];
    positive?: boolean;
}) => {
    const Icon = positive ? CircleCheckIcon : CircleAlertIcon;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm">
                            <Icon
                                className={cn(
                                    "mt-0.5 size-4 shrink-0",
                                    positive
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-amber-600 dark:text-amber-400"
                                )}
                            />
                            {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

export const InterviewResultView = ({ result }: { result: InterviewResult }) => (
    <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardDescription>Итоговая оценка</CardDescription>
                <CardTitle className={cn("text-4xl tabular-nums", scoreTone(result.score))}>
                    {result.score}
                    <span className="text-lg text-muted-foreground"> / 100</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={result.score} />
                <p className="text-sm leading-relaxed">{result.summary}</p>
            </CardContent>
        </Card>
        <PointsCard title="Сильные стороны" items={result.strengths} positive />
        <PointsCard title="Что подтянуть" items={result.weaknesses} />
    </div>
);
