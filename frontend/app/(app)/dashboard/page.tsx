// app/(app)/dashboard/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLACEHOLDER_PROPERTIES = [
  {
    id: 1,
    nickname: "Sample Three-Family",
    address: "123 Example Street, Brooklyn, NY",
  },
];

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await supabase.auth
    .getUser()
    .then(({ data, error }) => (error ? null : data.user))
    .catch(() => redirect("/login?error=db-error"));

  if (!user) {
    redirect("/login?error=unauthorized");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
        <div>
          <p className="text-sm text-zinc-500">Signed in as</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <form action={signOut}>
          <Button
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            type="submit"
          >
            Sign out
          </Button>
        </form>
      </header>

      <section className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Properties</h1>
        <p className="mt-2 text-zinc-600">
          Select a property to view its monthly rent and utility bills.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PLACEHOLDER_PROPERTIES.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="hover:bg-zinc-50">
                <CardHeader>
                  <CardTitle>{property.nickname}</CardTitle>
                  <CardDescription>{property.address}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
