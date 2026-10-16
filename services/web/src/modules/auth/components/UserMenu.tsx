import { Link } from "@tanstack/react-router";
import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";
import { SidebarMenuButton } from "@/shared/ui/sidebar";
import { Skeleton } from "@/shared/ui/skeleton";

import { useSignOut } from "../hooks/use-auth-mutations";
import { useCurrentUser } from "../hooks/use-current-user";

interface UserMenuProps {
    onSignedOut: () => void;
}

const initials = (name?: string, email?: string) =>
    (name ?? email ?? "?")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

/** Аватар + меню пользователя, рассчитан на футер сайдбара */
export const UserMenu = ({ onSignedOut }: UserMenuProps) => {
    const { data: user, isPending } = useCurrentUser();
    const signOut = useSignOut();

    if (isPending) return <Skeleton className="h-12 w-full" />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                    <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                            {initials(user?.name, user?.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{user?.name ?? "Без имени"}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56" side="top" align="start">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/profile">
                        <UserIcon /> Профиль
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => signOut.mutate(undefined, { onSettled: onSignedOut })}
                >
                    <LogOutIcon /> Выйти
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
