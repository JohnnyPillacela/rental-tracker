// app/(app)/layout.tsx

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/shell/app-sidebar";


const PLACEHOLDER_PROPERTIES = [
    { id: 1, nickname: "Sample Three-Family" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const user = await supabase.auth
        .getUser()
        .then(({ data, error }) => (error ? null : data.user))
        .catch(() => redirect("/login?error=db-error"));

    if (!user) {
        redirect("/login?error=unauthorized");
    }

    return (
        <SidebarProvider>
            <AppSidebar
                email={user.email ?? ""}
                properties={PLACEHOLDER_PROPERTIES}
            />
            <SidebarInset>
                <header className="flex h-12 items-center border-b px-4 md:hidden">
                    <SidebarTrigger />
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}