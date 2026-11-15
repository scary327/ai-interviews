import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getListMessagesQueryKey, type Message, postSse, useListMessages } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errors";

/** Сообщение в UI: серверное или временное (ещё не сохранено / стримится) */
export type ChatMessage = Message & { pending?: boolean };

const draftMessage = (role: Message["role"], text: string): ChatMessage => ({
    id: `pending-${role}`,
    role,
    text,
    createdAt: new Date().toISOString(),
    pending: true
});

/**
 * Чат собеседования.
 * История — из React Query, ответ интервьюера стримится по SSE и показывается
 * по мере прихода. После окончания стрима историю перезапрашиваем с сервера.
 */
export const useInterviewChat = (interviewId: string) => {
    const queryClient = useQueryClient();
    const history = useListMessages(interviewId);

    const [sentText, setSentText] = useState<string | null>(null);
    const [streamedText, setStreamedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Ушли со страницы — обрываем стрим
    useEffect(() => () => abortRef.current?.abort(), []);

    const isStreaming = sentText !== null;

    const send = useCallback(
        async (text: string): Promise<boolean> => {
            const controller = new AbortController();
            abortRef.current = controller;
            setError(null);
            setSentText(text);
            setStreamedText("");

            let done = false;
            try {
                await postSse(
                    `/ai/interviews/${interviewId}/messages`,
                    { text },
                    {
                        signal: controller.signal,
                        onEvent: ({ event, data }) => {
                            if (event === "delta") {
                                const chunk = (JSON.parse(data) as { text: string }).text;
                                setStreamedText((prev) => (prev ?? "") + chunk);
                            }
                            if (event === "done") done = true;
                            if (event === "error") {
                                throw new Error((JSON.parse(data) as { detail: string }).detail);
                            }
                        }
                    }
                );
                // Стрим закрылся без done — ответ на сервере не сохранён
                if (!done) throw new Error("Ответ интервьюера прервался — отправьте ответ ещё раз");
                await queryClient.invalidateQueries({
                    queryKey: getListMessagesQueryKey(interviewId)
                });
                return true;
            } catch (e) {
                if (!controller.signal.aborted) setError(getErrorMessage(e));
                return false;
            } finally {
                setSentText(null);
                setStreamedText(null);
            }
        },
        [interviewId, queryClient]
    );

    const messages = useMemo<ChatMessage[]>(() => {
        const list: ChatMessage[] = [...(history.data ?? [])];
        if (sentText !== null) list.push(draftMessage("candidate", sentText));
        if (streamedText !== null) list.push(draftMessage("interviewer", streamedText));
        return list;
    }, [history.data, sentText, streamedText]);

    return {
        messages,
        isLoading: history.isPending,
        loadError: history.error,
        refetch: history.refetch,
        isStreaming,
        error,
        send
    };
};
