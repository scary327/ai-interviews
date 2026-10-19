import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";

import { useCurrentUser } from "@/modules/auth";
import { InterviewList, InterviewStats } from "@/modules/interview";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/ui/button";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="space-y-3">
        <h2 className="text-lg font-medium">{title}</h2>
        {children}
    </section>
);

export const DashboardPage = () => {
    const { data: user } = useCurrentUser();

    return (
        <div className="space-y-8">
            <PageHeader
                title={user?.name ? `Привет, ${user.name.split(" ")[0]}!` : "Привет!"}
                description="Готовы к следующему собеседованию?"
                actions={
                    <Button asChild>
                        <Link to="/interviews/new">
                            <PlusIcon /> Новое собеседование
                        </Link>
                    </Button>
                }
            />

            <InterviewStats />

            <Section title="Незавершённые">
                <InterviewList status="IN_PROGRESS" limit={3} />
            </Section>

            <Section title="Последние результаты">
                <InterviewList status="FINISHED" limit={3} />
            </Section>
        </div>
    );
};
