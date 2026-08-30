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
import { getProperties, PropertyListItem } from "@/features/properties/queries";

const properties = await getProperties()

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
        <div className="mx-auto w-full min-w-0 max-w-5xl px-6 py-10">

            <section className="py-2">
                <h1 className="text-3xl font-semibold tracking-tight">Properties</h1>
                <p className="mt-2 text-zinc-600">
                    Select a property to view its monthly rent and utility bills.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {properties.length === 0 ? (
                        <p className="mt-8 text-zinc-600">No properties yet.</p>
                    ) : (
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {properties.map((property) => (
                                <Link key={property.id} href={`/properties/${property.id}`}>
                                    <Card className="hover:bg-zinc-50">
                                        <CardHeader>
                                            <CardTitle>{property.nickname}</CardTitle>
                                            <CardDescription>
                                                {property.street_address}, {property.city}, {property.state}{" "}
                                                {property.zip_code}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
