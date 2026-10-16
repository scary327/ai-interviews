import { SendHorizontalIcon } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

import { useDraft } from "../store/drafts";

interface ChatComposerProps {
    interviewId: string;
    disabled?: boolean;
    onSend: (text: string) => void;
}

export const ChatComposer = ({ interviewId, disabled, onSend }: ChatComposerProps) => {
    const [draft, setDraft] = useDraft(interviewId);
    const canSend = !disabled && draft.trim().length > 0;

    const submit = (e?: FormEvent) => {
        e?.preventDefault();
        if (!canSend) return;
        onSend(draft.trim());
        setDraft("");
    };

    // Enter — отправить, Shift+Enter — новая строка
    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
        }
    };

    return (
        <form onSubmit={submit} className="flex items-end gap-2">
            <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ваш ответ… (Shift+Enter — новая строка)"
                aria-label="Ваш ответ"
                className="max-h-48 min-h-11 resize-none"
                rows={1}
            />
            <Button type="submit" size="icon" disabled={!canSend} aria-label="Отправить">
                <SendHorizontalIcon />
            </Button>
        </form>
    );
};
