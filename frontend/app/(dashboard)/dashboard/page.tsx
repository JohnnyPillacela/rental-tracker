// dashboard/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=unauthorized");
    }

    const { count, error: propertyError } = await supabase
        .from("properties")
        .select("id", {
            count: "exact",
            head: true,
        });

    return (
        <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
            <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
                <div>
                    <p className="text-sm text-zinc-500">Signed in as</p>
                    <p className="font-medium">{user.email}</p>
                </div>

                <form action={signOut}>
                    <button
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                        type="submit"
                    >
                        Sign out
                    </button>
                </form>
            </header>

            <section className="py-10">
                <p className="text-sm font-medium text-zinc-500">February 2026</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Dashboard
                </h1>

                <div className="mt-8 max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-zinc-600">Properties</p>

                    {propertyError ? (
                        <p className="mt-2 text-sm text-red-700">
                            Property data could not be loaded.
                        </p>
                    ) : (
                        <p className="mt-2 text-3xl font-semibold">{count ?? 0}</p>
                    )}
                </div>
            </section>
        </main>
    );
}