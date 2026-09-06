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

export type AddPropertyState =
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

export async function addProperty(
    _prev: AddPropertyState,
    formData: FormData,): Promise<AddPropertyState> {
    const nickname = formData.get("nickname")?.toString().trim() ?? "";
    const street_address = formData.get("address")?.toString().trim() ?? "";
    const city = formData.get("city")?.toString().trim() ?? "";
    const state = formData.get("state")?.toString().trim() ?? "";
    const zip_code = formData.get("zip")?.toString().trim() ?? "";
    const unitCount = Number(formData.get("unit_count"));

    if (!nickname || !street_address || !city || !state || !zip_code) {
        return { ok: false, error: "All address fields are required." };
    }
    if (!Number.isInteger(unitCount) || unitCount < 1 || unitCount > 10) {
        return { ok: false, error: "Enter between 1 and 10 apartments." };
    }

    const userResult = await getUserResult();

    if (!userResult.ok) {
        return { ok: false, error: "Service temporarily unavailable. Try again." };
    }
    if (!userResult.data) {
        return { ok: false, error: "You must be signed in." };
    }

    const supabase = await createClient();
    const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
            nickname,
            street_address,
            city,
            state,
            zip_code,
        })
        .select("id")
        .single();

    if (propertyError) {
        console.error("Failed to add property:", propertyError.message);
        return { ok: false, error: "Could not add property." };
    }

    const { error: unitsError } = await supabase.from("units").insert(
        Array.from({ length: unitCount }, (_, i) => ({
            property_id: property.id,
            name: `Unit ${i + 1}`,
            display_order: i + 1,
        })),
    );

    if (unitsError) {
        console.error("Failed to add units:", unitsError.message);
        await supabase.from("properties").delete().eq("id", property.id);
        return { ok: false, error: "Could not add property." };
    }

    revalidatePath("/dashboard", "layout");
    return { ok: true };
}