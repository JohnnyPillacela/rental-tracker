// features/dashboard/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type RentStatus = Database["public"]["Enums"]["rent_status"];

const RENT_STATUSES: RentStatus[] = [
    "occupied",
    "vacant",
    "partial_month",
    "nonpaying",
];

export type UpdateRentRecordState =
    | { ok: true }
    | { ok: false; error: string }
    | null;

export async function updateRentRecord(
    _prev: UpdateRentRecordState,
    formData: FormData,
): Promise<UpdateRentRecordState> {
    const idRaw = formData.get("id");
    const collectedRaw = formData.get("collected_amount");
    const statusRaw = formData.get("status");

    const id = typeof idRaw === "string" ? Number(idRaw) : NaN;
    const collected_amount =
        typeof collectedRaw === "string" ? Number(collectedRaw) : NaN;
    const status = typeof statusRaw === "string" ? statusRaw : "";

    if (!Number.isFinite(id) || id <= 0) {
        return { ok: false, error: "Invalid rent record." };
    }

    if (!Number.isFinite(collected_amount) || collected_amount < 0) {
        return { ok: false, error: "Collected amount must be zero or greater." };
    }

    if (!RENT_STATUSES.includes(status as RentStatus)) {
        return { ok: false, error: "Invalid status." };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { ok: false, error: "You must be signed in." };
    }

    const { error } = await supabase
        .from("monthly_rent_records")
        .update({
            collected_amount,
            status: status as RentStatus,
        })
        .eq("id", id);

    if (error) {
        console.error("Failed to update rent record:", error.message);
        return { ok: false, error: "Could not save rent record." };
    }

    revalidatePath("/dashboard");
    return { ok: true };
}