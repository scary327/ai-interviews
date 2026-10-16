import { TriangleAlertIcon } from "lucide-react";

import { getErrorMessage } from "@/shared/lib/errors";
import { Button } from "@/shared/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/shared/ui/empty";

interface ErrorStateProps {
    error?: unknown;
    title?: string;
    onRetry?: () => void;
}

export const ErrorState = ({ error, title = "Не удалось загрузить", onRetry }: ErrorStateProps) => (
    <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <TriangleAlertIcon />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
        </EmptyHeader>
        {onRetry && (
            <EmptyContent>
                <Button variant="outline" onClick={onRetry}>
                    Попробовать ещё раз
                </Button>
            </EmptyContent>
        )}
    </Empty>
);
