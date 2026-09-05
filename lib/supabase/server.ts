// lib/supabase/server.ts

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { isAuthError, isAuthRetryableFetchError, isAuthSessionMissingError, type User } from "@supabase/supabase-js";
import { cache } from "react";
import { SUPABASE_ERRORS, type SupabaseErrorCode, type Result } from "../types";
import { redirect } from "next/navigation";

const REQUEST_TIMEOUT_MS = 2_000;
const MAX_ERROR_CAUSE_DEPTH = 5;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;

  return fetch(input, { ...init, signal, cache: "no-store" });
}

function raceWithTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const timeout = new Promise<never>((_, reject) => {
    timeoutSignal.addEventListener("abort", () => {
      reject(timeoutSignal.reason);
    });
  });
  return Promise.race([promise, timeout]);
}

function errorChain(error: unknown): Error[] {
  const chain: Error[] = [];
  let current: unknown = error;
  while (current instanceof Error && chain.length < MAX_ERROR_CAUSE_DEPTH) {
    chain.push(current);
    current = current.cause;
  }
  return chain;
}

function classifyError(error: unknown): SupabaseErrorCode | null {
  const chain = errorChain(error);

  if (chain.some((e) => e.name === "TimeoutError")) return SUPABASE_ERRORS.TIMEOUT;
  if (chain.some((e) => e.name === "AbortError")) return SUPABASE_ERRORS.ABORTED;
  if (chain.some((e) => isAuthRetryableFetchError(e) || e.message === "fetch failed")) {
    return SUPABASE_ERRORS.UNAVAILABLE;
  }

  return null;
}

export function throwIfSupabaseUnavailable(error: unknown): void {
  const code = classifyError(error);
  if (!code) return;

  console.error(code, error);
  throw new Error("Authentication service is unavailable.", { cause: error });
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!publishableKey) {
    throw new Error(
      "Missing env: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { url, publishableKey };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseConfig();

  return createServerClient<Database>(url, publishableKey, {
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          /*
          * Server Components cannot write cookies during rendering.
          * This is acceptable during the connection-only phase because
          * authentication and session refresh are not implemented yet.
          *
          * Before adding authentication, add Next.js Proxy-based session
          * refresh so updated auth cookies are written to the response.
          */
        }
      }
    }
  })

}

export const getUserResult = cache(
  async (): Promise<Result<User | null, SupabaseErrorCode>> => {
    const supabase = await createClient();

    try {
      const { data, error } = await raceWithTimeout(supabase.auth.getUser());
      if (error) throw error;
      return { ok: true, data: data.user };
    } catch (error) {
      if (isAuthSessionMissingError(error)) return { ok: true, data: null };

      const code = classifyError(error);
      if (code) {
        console.error(code, error);
        return { ok: false, error: code };
      }

      if (isAuthError(error)) {
        console.warn(SUPABASE_ERRORS.AUTH, error.name, error.code);
        return { ok: true, data: null };
      }
      console.error(SUPABASE_ERRORS.UNEXPECTED, error);
      return { ok: false, error: SUPABASE_ERRORS.UNEXPECTED };
    }
  },
);

export async function requireUser(): Promise<User> {
  const result = await getUserResult();

  if (!result.ok) {
    throw new Error("Authentication service is unavailable.", {
      cause: result.error,
    });
  }

  if (!result.data) {
    redirect("/login?error=unauthorized");
  }

  return result.data;
}

export async function getOptionalUser(): Promise<User | null> {
  const result = await getUserResult();
  return result.ok ? result.data : null;
}