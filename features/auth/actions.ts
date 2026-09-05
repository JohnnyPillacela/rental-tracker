// features/auth/actions.ts

"use server";

import {
    createClient,
    throwIfSupabaseUnavailable,
} from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SignUpState =
    | { ok: true }
    | { ok: false; error: string }
    | null;

export async function signUp(
    _prev: SignUpState,
    formData: FormData,
): Promise<SignUpState> {
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordConfirmation = formData.get("passwordConfirmation");

    // Validate types, normalized email, minimum length, and matching passwords.
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email: normalizeEmail(email),
        password: validatePassword(password, passwordConfirmation) ? password as string : "",
    });

    if (error) return { ok: false, error: error.message };
    if (!data.session) {
        // TODO: When email confirmation is enabled, send users through
        // the confirmation callback/token-exchange flow here.
        return { ok: false, error: "Check your email to finish creating your account." };
    }

    redirect("/dashboard");
}

export async function signIn(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        redirect("/login?error=missing-fields");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });

    if (error) {
        throwIfSupabaseUnavailable(error);
        console.error("Supabase sign-in failed: ", error.message);
        redirect("/login?error=invalid-credentials");
    }

    redirect("/dashboard");
}

function normalizeEmail(email: FormDataEntryValue | null): string {
    if (!email || typeof email !== "string") {
        return "";
    }
    return email.toLowerCase().trim();
}

function validatePassword(password: FormDataEntryValue | null, passwordConfirmation: FormDataEntryValue | null): boolean {
    if (!password || !passwordConfirmation || typeof password !== "string" || typeof passwordConfirmation !== "string") {
        return false;
    }
    return password === passwordConfirmation;
}