import { useListMessages } from "@/shared/api";
import { Skeleton } from "@/shared/ui/skeleton";

import { ChatMessageBubble } from "./ChatMessageBubble";

/** Полная переписка собеседования (только чтение) */
export const InterviewTranscript = ({ interviewId }: { interviewId: string }) => {
    const { data, isPending } = useListMessages(interviewId);

    if (isPending) return <Skeleton className="h-40" />;
    if (!data?.length) return <p className="text-sm text-muted-foreground">Переписка пуста</p>;

    return (
        <div className="flex flex-col gap-4">
            {data.map((m) => (
                <ChatMessageBubble key={m.id} message={m} />
            ))}
        </div>
    );
};
