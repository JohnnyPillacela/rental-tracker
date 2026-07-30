// lib/supabase/server.ts

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

    return createServerClient(url, publishableKey, {
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