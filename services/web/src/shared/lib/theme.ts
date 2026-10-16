import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

/** Выбранная тема, сохраняется в localStorage */
export const themeAtom = atomWithStorage<Theme>("theme", "system", undefined, {
    getOnInit: true
});

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const subscribeSystemTheme = (onChange: () => void) => {
    const query = darkQuery();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
};

/** Тема, которая реально применена (system → light/dark) */
export const useResolvedTheme = (): "light" | "dark" => {
    const theme = useAtomValue(themeAtom);
    const systemDark = useSyncExternalStore(subscribeSystemTheme, () => darkQuery().matches);
    if (theme === "system") return systemDark ? "dark" : "light";
    return theme;
};

/** Вешает класс .dark на <html>. Вызывается один раз в провайдерах */
export const useApplyTheme = () => {
    const resolved = useResolvedTheme();

    useEffect(() => {
        document.documentElement.classList.toggle("dark", resolved === "dark");
        document.documentElement.style.colorScheme = resolved;
    }, [resolved]);
};
