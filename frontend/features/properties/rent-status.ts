// features/dashboard/rent-status.ts

import type { Database } from "@/lib/supabase/database.types";

export type RentStatus = Database["public"]["Enums"]["rent_status"];

export const RENT_STATUSES: RentStatus[] = [
  "occupied",
  "vacant",
  "partial_month",
  "nonpaying",
];

export const STATUS_LABEL: Record<RentStatus, string> = {
  occupied: "Occupied",
  vacant: "Vacant",
  partial_month: "Partial Month",
  nonpaying: "Non-Paying",
};

export const STATUS_VARIANT: Record<
  RentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  occupied: "default",
  vacant: "secondary",
  partial_month: "outline",
  nonpaying: "destructive",
};