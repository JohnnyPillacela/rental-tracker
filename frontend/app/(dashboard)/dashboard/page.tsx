// dashboard/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { error } = await searchParams;
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}