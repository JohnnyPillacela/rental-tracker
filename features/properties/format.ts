// features/properties/format.ts

import { format, parseISO } from "date-fns";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatMonthLabel(month: string): string {
  return format(parseISO(month), "MMMM yyyy");
}

export function formatInterestRate(interestRate: number | null): string {
  if (interestRate === null) return "—";
  return `${interestRate}%`;
}
