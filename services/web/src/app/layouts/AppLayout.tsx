import { Outlet } from "@tanstack/react-router";

import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Separator } from "@/shared/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";

import { AppSidebar } from "./AppSidebar";

/**
 * Лейаут кабинета: сайдбар (на мобилке — шторка) + хедер + контент.
 * Высота фиксирована по экрану, скроллится только область контента —
 * так комната собеседования может растянуть чат на всю высоту.
 */
export const AppLayout = () => (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <div className="flex-1" />
                <ThemeToggle />
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto h-full w-full max-w-6xl p-4 md:p-6">
                    <Outlet />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
);
