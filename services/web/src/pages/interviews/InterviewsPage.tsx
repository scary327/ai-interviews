import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { InterviewList, STATUS_LABELS } from "@/modules/interview";
import type { InterviewStatus } from "@/shared/api";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

export type InterviewsFilter = "all" | Exclude<InterviewStatus, "CREATED">;

interface InterviewsPageProps {
    filter: InterviewsFilter;
    onFilterChange: (filter: InterviewsFilter) => void;
}

export const InterviewsPage = ({ filter, onFilterChange }: InterviewsPageProps) => (
    <div className="space-y-6">
        <PageHeader
            title="История"
            description="Все ваши собеседования"
            actions={
                <Button asChild>
                    <Link to="/interviews/new">
                        <PlusIcon /> Новое
                    </Link>
                </Button>
            }
        />

        <ToggleGroup
            type="single"
            variant="outline"
            value={filter}
            onValueChange={(v) => v && onFilterChange(v as InterviewsFilter)}
        >
            <ToggleGroupItem value="all">Все</ToggleGroupItem>
            <ToggleGroupItem value="IN_PROGRESS">{STATUS_LABELS.IN_PROGRESS}</ToggleGroupItem>
            <ToggleGroupItem value="FINISHED">{STATUS_LABELS.FINISHED}</ToggleGroupItem>
        </ToggleGroup>

        <InterviewList status={filter === "all" ? undefined : filter} />
    </div>
);
