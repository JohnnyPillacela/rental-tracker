// app/(app)/layout.tsx

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase/server";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/shell/app-sidebar";
import { getProperties } from "@/features/properties/queries";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const user = await requireUser();
    const properties = await getProperties();

    return (
        <SidebarProvider>
            <AppSidebar
                email={user.email ?? ""}
                properties={properties}
            />
            <SidebarInset className="min-w-0">
                <header className="flex h-12 items-center border-b px-4 md:hidden">
                    <SidebarTrigger />
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}