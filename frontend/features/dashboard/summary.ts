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
  interest_rate: number | null;
  start_month: string;
  end_month: string | null;
  scheduled_payment: number;
  property: {
    id: number;
  };
};

export type DashboardSummary = {
  expectedRent: number;
  collectedRent: number;
  tenantOverdue: number;
  vacancyLoss: number;
  utilityExpenses: number;
  mortgagePayment: number;
  interestRate: number | null;
};

/** Inclusive month range; null end_month = open-ended. */
function isMortgagePeriodActive(
  period: Pick<MortgagePeriodRecord, "start_month" | "end_month">,
  month: string,
): boolean {
  if (period.start_month > month) return false;
  if (period.end_month !== null && period.end_month < month) return false;
  return true;
}

// TODO(property-month): Property-scoped views (e.g. properties/1/month)
// should call this with the route propertyId. Do not flatten all properties.
export function getMortgageForProperty(
  mortgagePeriods: MortgagePeriodRecord[],
  month: string,
  propertyId: number,
): { scheduledPayment: number; interestRate: number | null } {
  const activePeriods = mortgagePeriods.filter(
    (period) =>
      period.property.id === propertyId &&
      isMortgagePeriodActive(period, month),
  );

  return {
    scheduledPayment: activePeriods.reduce(
      (total, period) => total + period.scheduled_payment,
      0,
    ),
    interestRate: uniqueInterestRate(activePeriods),
  };
}

function uniqueInterestRate(
  periods: Pick<MortgagePeriodRecord, "interest_rate">[],
): number | null {
  const rates = [
    ...new Set(periods.map((period) => period.interest_rate)),
  ];

  if (rates.length !== 1) return null;
  return rates[0];
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

  // TODO(property-month): Portfolio rollup. Mixed property rates → null.
  // For a single property, skip this map and use getMortgageForProperty(..., propertyId).
  const propertyIds = [
    ...new Set(mortgagePeriods.map((period) => period.property.id)),
  ];

  const mortgagesByProperty = propertyIds.map((propertyId) =>
    getMortgageForProperty(mortgagePeriods, month, propertyId),
  );

  const mortgagePayment = mortgagesByProperty.reduce(
    (total, mortgage) => total + mortgage.scheduledPayment,
    0,
  );

  const interestRate = uniqueInterestRate(
    mortgagesByProperty.map((mortgage) => ({
      interest_rate: mortgage.interestRate,
    })),
  );

  return {
    expectedRent,
    collectedRent,
    tenantOverdue,
    vacancyLoss,
    utilityExpenses,
    mortgagePayment,
    interestRate,
  };
}