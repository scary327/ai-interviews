import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { HistoryIcon, LayoutDashboardIcon, PlusIcon, UserIcon } from "lucide-react";

import { UserMenu } from "@/modules/auth";
import { Logo } from "@/shared/components/Logo";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar
} from "@/shared/ui/sidebar";

const NAV = [
    { to: "/dashboard", label: "Главная", icon: LayoutDashboardIcon },
    { to: "/interviews/new", label: "Новое собеседование", icon: PlusIcon },
    { to: "/interviews", label: "История", icon: HistoryIcon },
    { to: "/profile", label: "Профиль", icon: UserIcon }
] as const;

const isActive = (pathname: string, to: string) => {
    // «История» подсвечиваем и внутри собеса, но не на «Новом»
    if (to === "/interviews") {
        return pathname.startsWith("/interviews") && pathname !== "/interviews/new";
    }
    return pathname === to;
};

export const AppSidebar = () => {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const navigate = useNavigate();
    const { setOpenMobile } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard">
                                <Logo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV.map(({ to, label, icon: Icon }) => (
                                <SidebarMenuItem key={to}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(pathname, to)}
                                        tooltip={label}
                                    >
                                        {/* На мобилке сайдбар — шторка, закрываем после перехода */}
                                        <Link to={to} onClick={() => setOpenMobile(false)}>
                                            <Icon />
                                            <span>{label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <UserMenu onSignedOut={() => void navigate({ to: "/login" })} />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};
