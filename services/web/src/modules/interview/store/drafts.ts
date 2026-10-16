import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";

/**
 * Черновики ответов по собеседованиям: не теряются при перезагрузке
 * и при переходе между страницами. Ключ — id собеседования.
 */
const draftsAtom = atomWithStorage<Record<string, string>>("interview-drafts", {});

export const useDraft = (interviewId: string) => {
    const [drafts, setDrafts] = useAtom(draftsAtom);

    const setDraft = useCallback(
        (text: string) =>
            setDrafts((prev) => {
                const { [interviewId]: _, ...rest } = prev;
                return text ? { ...rest, [interviewId]: text } : rest;
            }),
        [interviewId, setDrafts]
    );

    return [drafts[interviewId] ?? "", setDraft] as const;
};
