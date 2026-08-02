// features/dashboard/queries.ts

import "server-only";

import { createClient } from "@/lib/supabase/server";

export const DASHBOARD_MONTH = "2026-02-01";

export async function getDashboardData() {
  const supabase = await createClient();

  const [rentResult, utilityResult] = await Promise.all([
    supabase
      .from("monthly_rent_records")
      .select(`
        id,
        month,
        expected_amount,
        collected_amount,
        status,
        notes,
        rental_space:rental_spaces!inner (
          id,
          name,
          space_type,
          unit:units!inner (
            id,
            name,
            display_order,
            property:properties!inner (
              id,
              nickname
            )
          )
        )
      `)
      .eq("month", DASHBOARD_MONTH)
      .order("id"),

    supabase
      .from("monthly_utility_bills")
      .select(`
        id,
        month,
        amount,
        notes,
        utility_account:utility_accounts!inner (
          id,
          name,
          utility_category:utility_categories!inner (
            code,
            display_name
          ),
          property:properties!inner (
            id,
            nickname
          )
        )
      `)
      .eq("month", DASHBOARD_MONTH)
      .order("id"),
  ]);

  if (rentResult.error) {
    console.error(
      "Failed to load dashboard rent records:",
      rentResult.error.message,
    );

    throw new Error("Dashboard rent records could not be loaded.");
  }

  if (utilityResult.error) {
    console.error(
      "Failed to load dashboard utility bills:",
      utilityResult.error.message,
    );

    throw new Error("Dashboard utility bills could not be loaded.");
  }

  return {
    month: DASHBOARD_MONTH,
    rentRecords: rentResult.data,
    utilityBills: utilityResult.data,
  };
}

export type DashboardData = Awaited<
  ReturnType<typeof getDashboardData>
>;