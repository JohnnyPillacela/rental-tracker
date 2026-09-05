// features/auth/components/signup-form.tsx

"use client";

import { useActionState } from "react";
import { signUp } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpForm() {
    const [state, formAction, pending] = useActionState(signUp, null);

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    autoComplete="email"
                    className="h-9"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    type="email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    aria-describedby="password-help"
                    autoComplete="new-password"
                    className="h-9"
                    id="password"
                    minLength={6}
                    name="password"
                    required
                    type="password"
                />
                <p id="password-help" className="text-xs text-muted-foreground">
                    Use at least 6 characters.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirm password</Label>
                <Input
                    autoComplete="new-password"
                    className="h-9"
                    id="passwordConfirmation"
                    minLength={6}
                    name="passwordConfirmation"
                    required
                    type="password"
                />
            </div>

            {state && !state.ok ? (
                <p
                    aria-live="polite"
                    className="text-sm text-destructive"
                    role="alert"
                >
                    {state.error}
                </p>
            ) : null}

            <Button className="w-full" disabled={pending} size="lg" type="submit">
                {pending ? "Creating account…" : "Create account"}
            </Button>
        </form>
    );
}