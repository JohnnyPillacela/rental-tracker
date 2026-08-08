// features/dashboard/summary.ts

import type { Database } from "@/lib/supabase/database.types";

type RentStatus = Database["public"]["Enums"]["rent_status"];

type RentAmountRecord = {
  expected_amount: number;
  collected_amount: number;
  status: RentStatus;
};

type UtilityAmountRecord = {
  amount: number;
};

export type DashboardSummary = {
  expectedRent: number;
  collectedRent: number;
  tenantOverdue: number;
  vacancyLoss: number;
  utilityExpenses: number;
};

export function calculateDashboardSummary(
  rentRecords: RentAmountRecord[],
  utilityBills: UtilityAmountRecord[],
): DashboardSummary {
  const expectedRent = rentRecords.reduce(
    (total, record) => total + record.expected_amount,
    0,
  );

  const collectedRent = rentRecords.reduce(
    (total, record) => total + record.collected_amount,
    0,
  );

  const tenantOverdue = rentRecords
    .filter((record) => record.status !== "vacant")
    .reduce(
      (total, record) =>
        total +
        Math.max(
          record.expected_amount - record.collected_amount,
          0,
        ),
      0,
    );

  const vacancyLoss = rentRecords
    .filter((record) => record.status === "vacant")
    .reduce(
      (total, record) =>
        total +
        Math.max(
          record.expected_amount - record.collected_amount,
          0,
        ),
      0,
    );

  const utilityExpenses = utilityBills.reduce(
    (total, bill) => total + bill.amount,
    0,
  );

  return {
    expectedRent,
    collectedRent,
    tenantOverdue,
    vacancyLoss,
    utilityExpenses,
  };
}