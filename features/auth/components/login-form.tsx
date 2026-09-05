// features/auth/components/login-form.tsx

"use client";

import { signIn } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
    error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {
    return (
        <form action={signIn} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                    autoComplete="email"
                    className="h-9"
                    id="login-email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                    autoComplete="current-password"
                    className="h-9"
                    id="login-password"
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
                                ? "Log in to access your dashboard."
                                : "An unknown error occurred."}
                </p>
            ) : null}

            <Button className="w-full" size="lg" type="submit">
                Log in
            </Button>
        </form>
    );
}