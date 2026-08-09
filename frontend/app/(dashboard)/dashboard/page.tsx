// dashboard/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/features/dashboard/queries";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { RentRecordsTable } from "@/features/dashboard/components/rent-records-table";
import { UtilityBillsTable } from "@/features/dashboard/components/utility-bills-table";
import { formatMonthLabel } from "@/features/dashboard/format";

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
                    {formatMonthLabel(dashboardData.month)}
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Monthl Rent and Utility Bills Summary
                </h1>

                <p className="mt-2 text-zinc-600">
                    Summary of the monthly rent and utility bills for all your properties.
                </p>

                <SummaryCards summary={dashboardData.summary} />
                <RentRecordsTable rentRecords={dashboardData.rentRecords} />
                <UtilityBillsTable utilityBills={dashboardData.utilityBills} />
            </section>
        </main>
    );
}