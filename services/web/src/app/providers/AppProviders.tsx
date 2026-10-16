import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import type { ReactNode } from "react";

import { appStore } from "@/shared/api";
import { useApplyTheme } from "@/shared/lib/theme";
import { Toaster } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";

import { queryClient } from "./query-client";

const ThemeSync = () => {
    useApplyTheme();
    return null;
};

export const AppProviders = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {/* Тот же store, что читают axios-интерцепторы и guard'ы роутера */}
        <JotaiProvider store={appStore}>
            <TooltipProvider>
                <ThemeSync />
                {children}
                <Toaster richColors position="top-center" />
            </TooltipProvider>
        </JotaiProvider>
    </QueryClientProvider>
);
