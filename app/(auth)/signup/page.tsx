// app/(auth)/signup/page.tsx

import { getOptionalUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import SignUpForm from "@/features/auth/components/signup-form";
import Link from "next/link";

export default async function SignUpPage() {
    if (await getOptionalUser()) redirect("/dashboard");
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start tracking your rental properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <Link href="/login">Already have an account? Sign in</Link>
        </CardContent>
      </Card>
    );
  }