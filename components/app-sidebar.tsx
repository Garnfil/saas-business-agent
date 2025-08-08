"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {Icons} from "@/components/icons";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: Icons.home,
            },
            {
                title: "Chat",
                url: "/dashboard/chat",
                icon: Icons.messageSquare,
            },
            {
                title: "History",
                url: "/dashboard/history",
                icon: Icons.history,
            },
        ],
    },
    {
        title: "Data & Integration",
        items: [
            {
                title: "Data Sources",
                url: "/dashboard/data-sources",
                icon: Icons.database,
            },
            {
                title: "Analytics",
                url: "/dashboard/analytics",
                icon: Icons.barChart,
            },
            {
                title: "Reports",
                url: "/dashboard/reports",
                icon: Icons.fileText,
            },
        ],
    },
    {
        title: "Settings",
        items: [
            {
                title: "Profile",
                url: "/dashboard/profile",
                icon: Icons.user,
            },
            {
                title: "Organization",
                url: "/dashboard/organization",
                icon: Icons.building,
            },
            {
                title: "Team",
                url: "/dashboard/team",
                icon: Icons.users,
            },
            {
                title: "Billing",
                url: "/dashboard/billing",
                icon: Icons.creditCard,
            },
        ],
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white">
                                    <Icons.bot className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        AskSam
                                    </span>
                                    <span className="truncate text-xs">
                                        AI Business Assistant
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navigation.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={
                                                pathname === item.url
                                            }
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src="/placeholder.svg?height=32&width=32"
                                            alt="User"
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            JD
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            John Doe
                                        </span>
                                        <span className="truncate text-xs">
                                            john@acme.com
                                        </span>
                                    </div>
                                    <Icons.chevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/profile">
                                        <Icons.user className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Icons.settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Icons.logOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
