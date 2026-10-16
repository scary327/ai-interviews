import type { InterviewStatus } from "@/shared/api";
import { Badge } from "@/shared/ui/badge";

import { STATUS_LABELS } from "../constants";

const VARIANTS = {
    CREATED: "outline",
    IN_PROGRESS: "secondary",
    FINISHED: "default"
} as const;

export const InterviewStatusBadge = ({ status }: { status: InterviewStatus }) => (
    <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
);
