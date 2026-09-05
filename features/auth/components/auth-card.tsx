"use client";

import LoginForm from "@/features/auth/components/login-form";
import SignUpForm from "@/features/auth/components/signup-form";
import { PRODUCT_NAME } from "@/lib/brand";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

type AuthCardProps = {
    defaultTab?: "login" | "signup";
    loginError?: string;
};

export function AuthCard({
    defaultTab = "login",
    loginError,
}: AuthCardProps) {
    return (
        <Card className="w-full max-w-md py-8">
            <CardHeader>
                <CardTitle className="text-3xl font-semibold tracking-tight">
                    Welcome to {PRODUCT_NAME}
                </CardTitle>
                <CardDescription>
                    Log in or create an account to manage your rentals.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue={defaultTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Log in</TabsTrigger>
                        <TabsTrigger value="signup">Sign up</TabsTrigger>
                    </TabsList>

                    <TabsContent className="pt-4" value="login">
                        <LoginForm error={loginError} />
                    </TabsContent>

                    <TabsContent className="pt-4" value="signup">
                        <SignUpForm />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
