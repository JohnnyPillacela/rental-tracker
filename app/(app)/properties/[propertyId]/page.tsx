// app/(app)/properties/[propertyId]/page.tsx

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/features/properties/queries";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/features/properties/components/summary-cards";
import { RentRecordsTable } from "@/features/properties/components/rent-records-table";
import { UtilityBillsTable } from "@/features/properties/components/utility-bills-table";
import { formatMonthLabel } from "@/features/properties/format";
import { normalizeMonthParam } from "@/features/properties/month";
import { MonthNav } from "@/features/properties/components/month-nav";

type PropertyPageProps = {
    params: Promise<{
        propertyId: string;
    }>;
    searchParams: Promise<{
        error?: string;
        month?: string;
    }>;
};

async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/");
}

export default async function PropertyPage({
    params,
    searchParams,
}: PropertyPageProps) {
    const supabase = await createClient();
    const user = await supabase.auth
        .getUser()
        .then(({ data, error }) => (error ? null : data.user))
        .catch(() => redirect("/login?error=db-error"));

    if (!user) {
        redirect("/login?error=unauthorized");
    }

    const { propertyId: propertyIdParam } = await params;
    const propertyId = Number(propertyIdParam);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
        notFound();
    }

    const query = await searchParams;
    const month = normalizeMonthParam(query.month);
    const dashboardData = await getDashboardData(month, propertyId);

    if (!dashboardData) {
        notFound();
    }

    const isEmpty =
        dashboardData.rentRecords.length === 0 &&
        dashboardData.utilityBills.length === 0;

    return (
        <div className="mx-auto min-h-screen w-full min-w-0 max-w-5xl px-6 py-10">

            <section className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-500">
                        {formatMonthLabel(dashboardData.month)}
                    </p>
                    <MonthNav
                        month={dashboardData.month}
                        propertyId={propertyId}
                    />
                </div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Monthly Rent and Utility Bills Summary
                </h1>

                <p className="mt-2 text-zinc-600">
                    Summary of the monthly rent and utility bills for this property.
                </p>

                <SummaryCards summary={dashboardData.summary} />

                {
                    isEmpty ? (
                        <p className="mt-8 text-zinc-600">
                            No rent or utility records for this month.
                        </p>
                    ) : (
                        <>
                            <RentRecordsTable rentRecords={dashboardData.rentRecords} />
                            <UtilityBillsTable utilityBills={dashboardData.utilityBills} />
                        </>
                    )
                }

            </section>
        </div>
    );
}