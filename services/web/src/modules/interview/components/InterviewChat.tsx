import { HandIcon } from "lucide-react";

import { ErrorState } from "@/shared/components/ErrorState";
import { useAutoScroll } from "@/shared/hooks/use-auto-scroll";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";
import { Skeleton } from "@/shared/ui/skeleton";

import { useInterviewChat } from "../hooks/use-interview-chat";
import { ChatComposer } from "./ChatComposer";
import { ChatMessageBubble } from "./ChatMessageBubble";

/** Окно чата собеседования: лента сообщений + поле ввода. Растягивается на высоту родителя */
export const InterviewChat = ({ interviewId }: { interviewId: string }) => {
    const chat = useInterviewChat(interviewId);
    const scrollRef = useAutoScroll<HTMLDivElement>([chat.messages]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex max-w-3xl flex-col gap-4 py-4">
                    {chat.isLoading ? (
                        <>
                            <Skeleton className="h-16 w-2/3" />
                            <Skeleton className="ml-auto h-10 w-1/2" />
                        </>
                    ) : chat.loadError ? (
                        <ErrorState error={chat.loadError} onRetry={() => void chat.refetch()} />
                    ) : chat.messages.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <HandIcon />
                                </EmptyMedia>
                                <EmptyTitle>Собеседование готово</EmptyTitle>
                                <EmptyDescription>
                                    Поздоровайтесь и коротко расскажите о себе — интервьюер начнёт
                                    задавать вопросы
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        chat.messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)
                    )}
                </div>
            </div>

            <div className="mx-auto w-full max-w-3xl space-y-2 border-t pt-4">
                {chat.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{chat.error}</AlertDescription>
                    </Alert>
                )}
                <ChatComposer
                    interviewId={interviewId}
                    disabled={chat.isStreaming || chat.isLoading}
                    onSend={(text) => void chat.send(text)}
                />
            </div>
        </div>
    );
};
