import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/supabase/server";
import { PRODUCT_NAME } from "@/lib/brand";
import { AuthCard } from "@/features/auth/components/auth-card";

type LoginPageProps = {
    searchParams: Promise<{
        error?: string;
        mode?: string;
    }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const user = await getOptionalUser();

    if (user) {
        redirect("/dashboard");
    }

    const { error, mode } = await searchParams;
    const isSignUp = mode === "signup";

    return (
        <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
            <header className="border-b border-border">
                <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-6">
                    <Link href="/" className="text-lg font-medium tracking-tight">
                        {PRODUCT_NAME}
                    </Link>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <AuthCard
                    defaultTab={isSignUp ? "signup" : "login"}
                    loginError={error}
                />
            </main>
        </div>
    );
}
