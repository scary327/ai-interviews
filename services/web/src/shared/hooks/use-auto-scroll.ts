import { useEffect, useRef } from "react";

/**
 * Держит контейнер прокрученным вниз, пока пользователь сам не ушёл вверх.
 * Для чатов и логов: передай в deps то, что меняет содержимое.
 */
export const useAutoScroll = <T extends HTMLElement>(deps: unknown[]) => {
    const ref = useRef<T>(null);
    const stickToBottom = useRef(true);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onScroll = () => {
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return ref;
};
