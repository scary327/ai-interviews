import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import type { Interview } from "@/shared/api";
import { formatDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/shared/ui/card";

import { LEVEL_LABELS } from "../constants";
import { InterviewStatusBadge } from "./InterviewStatusBadge";

export const InterviewCard = ({ interview }: { interview: Interview }) => {
    const finished = interview.status === "FINISHED";

    return (
        <Card size="sm">
            <CardHeader>
                <CardTitle className="truncate">{interview.position}</CardTitle>
                <CardDescription>
                    {LEVEL_LABELS[interview.level]} · {formatDate(interview.createdAt)}
                </CardDescription>
                <CardAction>
                    <InterviewStatusBadge status={interview.status} />
                </CardAction>
            </CardHeader>
            <CardFooter className="justify-between gap-2">
                {finished && interview.result ? (
                    <Badge variant="outline">{interview.result.score} / 100</Badge>
                ) : (
                    <span />
                )}
                <Button variant="ghost" size="sm" asChild>
                    {finished ? (
                        <Link
                            to="/interviews/$interviewId/result"
                            params={{ interviewId: interview.id }}
                        >
                            Результат <ArrowRightIcon />
                        </Link>
                    ) : (
                        <Link to="/interviews/$interviewId" params={{ interviewId: interview.id }}>
                            Продолжить <ArrowRightIcon />
                        </Link>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};
