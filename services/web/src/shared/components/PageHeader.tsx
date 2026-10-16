import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    /** Кнопки справа от заголовка */
    actions?: ReactNode;
    className?: string;
}

export const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => (
    <div
        className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
        <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
);
