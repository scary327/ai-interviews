import { InterviewSetupForm } from "@/modules/interview";
import type { Interview } from "@/shared/api";
import { PageHeader } from "@/shared/components/PageHeader";
import { Card, CardContent } from "@/shared/ui/card";

export const NewInterviewPage = ({ onCreated }: { onCreated: (interview: Interview) => void }) => (
    <div className="mx-auto max-w-xl space-y-6">
        <PageHeader
            title="Новое собеседование"
            description="Выберите позицию и уровень — интервьюер подстроит вопросы"
        />
        <Card>
            <CardContent>
                <InterviewSetupForm onCreated={onCreated} />
            </CardContent>
        </Card>
    </div>
);
