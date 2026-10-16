import { BotMessageSquareIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface LogoProps {
    className?: string;
    /** Только иконка, без названия (свёрнутый сайдбар) */
    compact?: boolean;
}

export const Logo = ({ className, compact }: LogoProps) => (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BotMessageSquareIcon className="size-4" />
        </span>
        {!compact && <span className="truncate">AI Interviews</span>}
    </span>
);
