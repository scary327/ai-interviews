import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
};

/** true на экранах уже 768px (используется сайдбаром shadcn) */
export const useIsMobile = () =>
    useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false
    );
