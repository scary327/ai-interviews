import { Link, Outlet } from "@tanstack/react-router";

import { Logo } from "@/shared/components/Logo";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

/** Лейаут логина/регистрации: карточка по центру */
export const AuthLayout = () => (
    <div className="flex min-h-svh flex-col bg-muted/40">
        <header className="flex items-center justify-between p-4">
            <Link to="/">
                <Logo />
            </Link>
            <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <Outlet />
            </div>
        </main>
    </div>
);
