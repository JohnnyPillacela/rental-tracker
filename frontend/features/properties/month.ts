// features/properties/month.ts

import { addMonths, format, isValid, parse } from "date-fns";

export const DEFAULT_DASHBOARD_MONTH = "2026-02-01";

const MONTH_DAY_RE = /^\d{4}-\d{2}-01$/;
const MONTH_ONLY_RE = /^\d{4}-\d{2}$/;

function parseMonthDate(month: string) {
  return parse(month, "yyyy-MM-dd", new Date());
}

/** Coerce searchParam → YYYY-MM-01, or default if missing/invalid. */
export function normalizeMonthParam(value: string | undefined): string {
  if (!value) return DEFAULT_DASHBOARD_MONTH;

  const normalized = MONTH_ONLY_RE.test(value) ? `${value}-01` : value;

  if (!MONTH_DAY_RE.test(normalized)) return DEFAULT_DASHBOARD_MONTH;

  const date = parseMonthDate(normalized);
  if (!isValid(date)) return DEFAULT_DASHBOARD_MONTH;

  return normalized;
}

/** Shift by whole months; always returns YYYY-MM-01. */
export function shiftMonth(month: string, delta: number): string {
  return format(addMonths(parseMonthDate(month), delta), "yyyy-MM-dd");
}