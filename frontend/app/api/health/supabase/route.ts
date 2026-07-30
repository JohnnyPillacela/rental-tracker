// api/health/supabase/route.ts

import { NextResponse } from "next/server";

const TIMEOUT_MS = 3_000;

type FailureCategory =
    | "configuration"
    | "timeout"
    | "connection_failed"
    | "upstream_error";

enum HealthStatus {
    HEALTHY = "healthy",
    UNAVAILABLE = "unavailable",
}

type HealthResponseBase = {
    service: "supabase";
    timestamp: string;
    durationMs: number;
}

type HealthyHealthResponse = HealthResponseBase & {
    status: HealthStatus.HEALTHY;
}

type UnavailableHealthResponse = HealthResponseBase & {
    status: HealthStatus.UNAVAILABLE;
    category: FailureCategory;
    upstreamStatus?: number;
}

type HealthResponse = 
    | HealthyHealthResponse
    | UnavailableHealthResponse;

type SupabaseConfig = {
    supabaseHealthUrl: URL;
    supabasePublishableKey: string;
};
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<HealthResponse>> {
    const startTime = Date.now();
    let supabaseConfig: ReturnType<typeof getSupabaseConfig>;

    try {
        supabaseConfig = getSupabaseConfig();
    } catch {
        return unavailableResponse("configuration", startTime);
    }

    try {
        const { supabaseHealthUrl, supabasePublishableKey } = supabaseConfig;

        const response = await fetch(supabaseHealthUrl, {
            method: "GET",
            headers: {
                apiKey: supabasePublishableKey,
                Accept: "application/json",
            },
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (!response.ok) {
            // Supabase responded but returned HTTP 4xx or 5xx
            return unavailableResponse("upstream_error", startTime, response.status);
        }

        return healthyResponse(startTime);
    } catch (error) {
        // Error thrown by fetch()
        // Supbase stopped or connection refused
        // Timeout
        // DNS / network failure
        // Request aborted HTTP response

        const isTimeout =
            error instanceof Error &&
            (error.name === "TimeoutError" ||
                error.name === "AbortError");

        return unavailableResponse(
            isTimeout ? "timeout" : "connection_failed",
            startTime,
        );
    }

}

function getSupabaseConfig(): SupabaseConfig {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl) {
        throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!supabasePublishableKey) {
        throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    }

    const supabaseHealthUrl = new URL("/auth/v1/health", supabaseUrl);
    return { supabaseHealthUrl, supabasePublishableKey };
}

function healthyResponse(startTime: number): NextResponse<HealthyHealthResponse> {
    const body: HealthyHealthResponse = {
        service: "supabase",
        status: HealthStatus.HEALTHY,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
    };
    console.log(JSON.stringify(body));
    return NextResponse.json(body, {
        status: 200,
        headers: {
            "Cache-Control": "no-store, max-age=0",
        }
    });
}

function unavailableResponse(
    category: FailureCategory,
    startTime: number,
    upstreamStatus?: number,
): NextResponse<UnavailableHealthResponse> {
    const body: UnavailableHealthResponse = {
        service: "supabase",
        status: HealthStatus.UNAVAILABLE,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        category,
        upstreamStatus,
    };

    console.error(JSON.stringify(body));

    return NextResponse.json(body, {
        status: 503,
    });
}