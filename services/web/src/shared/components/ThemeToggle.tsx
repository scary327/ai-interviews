import { useSetAtom } from "jotai";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { themeAtom } from "@/shared/lib/theme";
import { Button } from "@/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";

export const ThemeToggle = () => {
    const setTheme = useSetAtom(themeAtom);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Сменить тему">
                    <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <SunIcon /> Светлая
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <MoonIcon /> Тёмная
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <MonitorIcon /> Как в системе
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
