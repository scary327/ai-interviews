import { BotIcon } from "lucide-react";

import { Markdown } from "@/shared/components/Markdown";
import { cn } from "@/shared/lib/utils";
import { Spinner } from "@/shared/ui/spinner";

import type { ChatMessage } from "../hooks/use-interview-chat";

export const ChatMessageBubble = ({ message }: { message: ChatMessage }) => {
    const isInterviewer = message.role === "interviewer";
    const isTyping = isInterviewer && message.pending && message.text === "";

    return (
        <div className={cn("flex gap-3", !isInterviewer && "justify-end")}>
            {isInterviewer && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BotIcon className="size-4" />
                </div>
            )}
            <div
                className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%]",
                    isInterviewer ? "bg-muted" : "bg-primary text-primary-foreground",
                    message.pending && !isInterviewer && "opacity-70"
                )}
            >
                {isTyping ? (
                    <Spinner className="my-1 text-muted-foreground" />
                ) : isInterviewer ? (
                    <Markdown>{message.text}</Markdown>
                ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}
            </div>
        </div>
    );
};
