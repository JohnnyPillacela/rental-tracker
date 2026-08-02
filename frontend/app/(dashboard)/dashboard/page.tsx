// dashboard/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/features/dashboard/queries";
import { Button } from "@/components/ui/button";

type DashboardPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/");
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const supabase = await createClient();
    const user = await supabase.auth
        .getUser()
        .then(({ data, error }) => (error ? null : data.user))
        .catch(() => redirect("/login?error=db-error"));

    if (!user) {
        redirect("/login?error=unauthorized");
    }

    const dashboardData = await getDashboardData();

    return (
        <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
            <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
                <div>
                    <p className="text-sm text-zinc-500">Signed in as</p>
                    <p className="font-medium">{user.email}</p>
                </div>

                <form action={signOut}>
                    <Button
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                        type="submit"
                    >
                        Sign out
                    </Button>
                </form>
            </header>

            <section className="py-10">
                <p className="text-sm font-medium text-zinc-500">
                    February 2026
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Dashboard data
                </h1>

                <p className="mt-2 text-zinc-600">
                    Raw authenticated data returned by Supabase.
                </p>

                <pre className="mt-8 overflow-x-auto rounded-xl bg-zinc-950 p-6 text-sm text-zinc-100">
                    {JSON.stringify(dashboardData, null, 2)}
                </pre>
            </section>
        </main>
    );
}