// features/shell/app-sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import { signOut } from "@/features/shell/actions";
import { PRODUCT_NAME } from "@/lib/brand";

type AppSidebarProps = {
    email: string;
    properties: {
        id: number;
        nickname: string;
    }[];
}

export function AppSidebar({ email, properties }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader>
                <p className="px-2 text-lg font-medium">{PRODUCT_NAME}</p>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={pathname === "/dashboard"}
                                    render={<Link href="/dashboard" />}
                                >
                                    <HomeIcon />
                                    Home
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Properties</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {properties.map((property) => (
                                <SidebarMenuItem key={property.id}>
                                    <SidebarMenuButton
                                        isActive={pathname === `/properties/${property.id}`}
                                        render={<Link href={`/properties/${property.id}`} />}
                                    >
                                        {property.nickname}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <p className="truncate px-2 text-sm text-muted-foreground">{email}</p>
                <form action={signOut}>
                    <Button type="submit" variant="outline" size="sm" className="w-full">
                        Sign out
                    </Button>
                </form>
            </SidebarFooter>
        </Sidebar>
    )
}