// features/properties/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUserResult } from "@/lib/supabase/server";
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

export type UpdateUtilityBillState =
    | { ok: true }
    | { ok: false; error: string }
    | null;

type UtilityBillUpdate = {
    id: number;
    amount: number;
}

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

    const userResult = await getUserResult();

    if (!userResult.ok) {
        return { ok: false, error: "Service temporarily unavailable. Try again." };
    }

    if (!userResult.data) {
        return { ok: false, error: "You must be signed in." };
    }

    const supabase = await createClient();
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

    revalidatePath("/properties/[propertyId]", "page");
    return { ok: true };
}

function parseUtilityBillUpdates(
    formData: FormData,
): UtilityBillUpdate[] | { error: string } {
    const ids = formData.getAll("id");

    if (ids.length === 0) {
        return { error: "No utility bills to save." };
    }

    const updates: UtilityBillUpdate[] = [];

    for (const idRaw of ids) {
        const id = typeof idRaw === "string" ? Number(idRaw) : NaN;
        const amountRaw = formData.get(`amount_${idRaw}`);
        const amount =
            typeof amountRaw === "string" ? Number(amountRaw) : NaN;

        if (!Number.isFinite(id) || id <= 0) {
            return { error: "Invalid utility bill." };
        }

        if (!Number.isFinite(amount) || amount < 0) {
            return { error: "Amount must be zero or greater." };
        }

        updates.push({ id, amount });
    }

    return updates;
}

export async function updateUtilityBills(
    _prev: UpdateUtilityBillState,
    formData: FormData,
): Promise<UpdateUtilityBillState> {
    const parsed = parseUtilityBillUpdates(formData);

    if ("error" in parsed) {
        return { ok: false, error: parsed.error };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { ok: false, error: "You must be signed in." };
    }

    for (const { id, amount } of parsed) {
        const { error } = await supabase
            .from("monthly_utility_bills")
            .update({ amount })
            .eq("id", id);

        if (error) {
            console.error("Failed to update utility bill:", error.message);
            return { ok: false, error: "Could not save utility bills." };
        }
    }

    revalidatePath("/properties/[propertyId]", "page");
    return { ok: true };
}