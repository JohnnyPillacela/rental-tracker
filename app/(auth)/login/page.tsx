import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getOptionalUser, throwIfSupabaseUnavailable } from "@/lib/supabase/server";
import { PRODUCT_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        throwIfSupabaseUnavailable(error);
        console.error("Supabase sign-in failed: ", error.message);
        redirect("/login?error=invalid-credentials");
    }

    redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const user = await getOptionalUser();

    if (user) {
        redirect("/dashboard");
    }

    const { error } = await searchParams;

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
                <Card className="w-full max-w-md py-8">
                    <CardHeader>
                        <CardTitle className="text-3xl font-semibold tracking-tight">
                            Sign in
                        </CardTitle>
                        <CardDescription>
                            Use your local development account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form action={signIn} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    autoComplete="email"
                                    className="h-9"
                                    defaultValue="local-owner@example.com"
                                    id="email"
                                    name="email"
                                    required
                                    type="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    autoComplete="current-password"
                                    className="h-9"
                                    id="password"
                                    name="password"
                                    required
                                    type="password"
                                />
                            </div>

                            {error ? (
                                <p className="text-sm text-destructive" role="alert">
                                    {error === "missing-fields"
                                        ? "Enter your email and password."
                                        : error === "invalid-credentials"
                                            ? "The email or password is incorrect."
                                            : error === "unauthorized"
                                                ? "Sign in to access your dashboard."
                                                : "An unknown error occurred."}
                                </p>
                            ) : null}

                            <Button className="w-full" size="lg" type="submit">
                                Sign in
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
