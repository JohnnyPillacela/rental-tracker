// features/dashboard/queries.ts

import "server-only";

import { createClient } from "@/lib/supabase/server";
import { calculateDashboardSummary } from "./summary";
import { DEFAULT_DASHBOARD_MONTH } from "./month";

export async function getDashboardData(
  month: string = DEFAULT_DASHBOARD_MONTH,
) {
  const supabase = await createClient();

  const [rentResult, utilityResult, mortgageResult] = await Promise.all([
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
      .eq("month", month)
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
      .eq("month", month)
      .order("id"),

    supabase
      .from("mortgage_periods")
      .select(`
      id,
      start_month,
      end_month,
      scheduled_payment,
      name,
      lender,
      property:properties!inner (
        id,
        nickname
      )
    `)
      .order("start_month"),
  ]);

  if (mortgageResult.error) {
    console.error(
      "Failed to load dashboard mortgage periods:",
      mortgageResult.error.message,
    );
    throw new Error("Dashboard mortgage periods could not be loaded.");
  }

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

  const rentRecords = rentResult.data;
  const utilityBills = utilityResult.data;
  const mortgagePeriods = mortgageResult.data;

  return {
    month: month,
    summary: calculateDashboardSummary(
      rentRecords,
      utilityBills,
      mortgagePeriods,
      month,
    ),
    rentRecords: rentResult.data,
    utilityBills: utilityResult.data,
  };
}

export type DashboardData = Awaited<
  ReturnType<typeof getDashboardData>
>;