// lib/types.ts

export type Result<T, E = string> =
    | { ok: true; data: T }
    | { ok: false; error: E };

export const SUPABASE_ERRORS = {
    AUTH: "supabase_auth",
    TIMEOUT: "supabase_timeout",
    UNAVAILABLE: "supabase_unavailable",
    ABORTED: "supabase_aborted",
    UNEXPECTED: "supabase_unexpected",
} as const;

export type SupabaseErrorCode =
    (typeof SUPABASE_ERRORS)[keyof typeof SUPABASE_ERRORS];
