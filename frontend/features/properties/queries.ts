// features/properties/queries.ts

import "server-only";

import { createClient } from "@/lib/supabase/server";
import { calculateDashboardSummary } from "./summary";
import { DEFAULT_DASHBOARD_MONTH } from "./month";

export async function getDashboardData(
  month: string = DEFAULT_DASHBOARD_MONTH,
  propertyId?: number,
) {
  const supabase = await createClient();

  if (propertyId !== undefined) {
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .maybeSingle();

    if (propertyError) {
      console.error(
        "Failed to load property:",
        propertyError.message,
      );
      throw new Error("Property could not be loaded.");
    }

    if (!property) {
      return null;
    }
  }

  let rentQuery = supabase
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
    .order("id");

  let utilityQuery = supabase
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
    .order("id");

  let mortgageQuery = supabase
    .from("mortgage_periods")
    .select(`
      id,
      start_month,
      end_month,
      scheduled_payment,
      name,
      lender,
      interest_rate,
      property:properties!inner (
        id,
        nickname
      )
    `)
    .order("start_month");

  if (propertyId !== undefined) {
    rentQuery = rentQuery.eq("rental_space.unit.property.id", propertyId);
    utilityQuery = utilityQuery.eq("utility_account.property.id", propertyId);
    mortgageQuery = mortgageQuery.eq("property_id", propertyId);
  }

  const [rentResult, utilityResult, mortgageResult] = await Promise.all([
    rentQuery,
    utilityQuery,
    mortgageQuery,
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
      propertyId,
    ),
    rentRecords: rentResult.data,
    utilityBills: utilityResult.data,
  };
}

export type DashboardData = NonNullable<
  Awaited<ReturnType<typeof getDashboardData>>
>;
