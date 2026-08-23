// features/dashboard/summary.ts

import type { RentStatus } from "@/features/dashboard/rent-status";

type RentAmountRecord = {
  expected_amount: number;
  collected_amount: number;
  status: RentStatus;
};

type UtilityAmountRecord = {
  amount: number;
};

type MortgagePeriodRecord = {
  start_month: string;
  end_month: string | null;
  scheduled_payment: number;
};

export type DashboardSummary = {
  expectedRent: number;
  collectedRent: number;
  tenantOverdue: number;
  vacancyLoss: number;
  utilityExpenses: number;
  mortgagePayment: number;
};

/** Inclusive month range; null end_month = open-ended. */
export function isMortgagePeriodActive(
  period: Pick<MortgagePeriodRecord, "start_month" | "end_month">,
  month: string,
): boolean {
  if (period.start_month > month) return false;
  if (period.end_month !== null && period.end_month < month) return false;
  return true;
}

export function calculateDashboardSummary(
  rentRecords: RentAmountRecord[],
  utilityBills: UtilityAmountRecord[],
  mortgagePeriods: MortgagePeriodRecord[],
  month: string,
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

  const mortgagePayment = mortgagePeriods
  .filter((period) => isMortgagePeriodActive(period, month))
  .reduce((total, period) => total + period.scheduled_payment, 0);


  return {
    expectedRent,
    collectedRent,
    tenantOverdue,
    vacancyLoss,
    utilityExpenses,
    mortgagePayment,
  };
}