// frontend/app/(auth)/login/page.tsx

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

async function signIn(formData: FormData) {
    "use server";

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
        console.error("Supabase sign-in failed: ", error.message);
        redirect("/login?error=invalid-credentials");
    }

    redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    const { error } = await searchParams;

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6">
            <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Rental Tracker
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Sign in
                </h1>

                <p className="mt-2 text-sm text-zinc-600">
                    Use your local development account.
                </p>

                <form action={signIn} className="mt-8 space-y-5">
                    <div>
                        <label
                            className="mb-2 block text-sm font-medium"
                            htmlFor="email"
                        >
                            Email
                        </label>

                        <input
                            autoComplete="email"
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                            defaultValue="local-owner@example.com"
                            id="email"
                            name="email"
                            required
                            type="email"
                        />
                    </div>

                    <div>
                        <label
                            className="mb-2 block text-sm font-medium"
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                            id="password"
                            name="password"
                            required
                            type="password"
                        />
                    </div>

                    {error ? (
                        <p className="text-sm text-red-700" role="alert">
                            {error === "missing-fields"
                                ? "Enter your email and password."
                                : error === "invalid-credentials"
                                    ? "The email or password is incorrect."
                                    : error === "unauthorized"
                                        ? "Sign in to access your dashboard."
                                        : "An unknown error occurred."}
                        </p>
                    ) : null}

                    <button
                        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white hover:bg-zinc-700"
                        type="submit"
                    >
                        Sign in
                    </button>
                </form>
            </section>
        </main>
    );
}