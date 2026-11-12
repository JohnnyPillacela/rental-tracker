// app/(app)/properties/[propertyId]/page.tsx

import { notFound } from "next/navigation";
import { getProperty } from "@/features/properties/queries";
import { requireUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DEFAULT_DASHBOARD_MONTH } from "@/features/properties/month";
import { formatCurrency } from "@/features/properties/format";

type PropertyPageProps = {
    params: Promise<{
        propertyId: string;
    }>;
};

const SAMPLE_UTILITIES: Record<string, string> = {
    elizabeth: "Elizabethtown Gas · PSEG",
    newark: "PSEG · Newark Water",
    brooklyn: "Con Edison · National Grid",
};

function sampleDetails(
    address: string,
    city: string,
    purchasePrice: number | null,
) {
    const utilities =
        SAMPLE_UTILITIES[city.trim().toLowerCase()] ?? "PSEG · local water";

    return [
        { emoji: "📍", label: "Address", value: address },
        {
            emoji: "💵",
            label: "Purchase price",
            value: formatCurrency(purchasePrice ?? 500_000),
        },
        { emoji: "📈", label: "Monthly rent", value: formatCurrency(4800) },
        { emoji: "📉", label: "Monthly expenses", value: formatCurrency(1250) },
        { emoji: "⚡", label: "Utilities", value: utilities },
        { emoji: "💰", label: "Monthly income", value: formatCurrency(4800) },
        { emoji: "🏠", label: "# of Units", value: "3" },
    ];
}

export default async function PropertyPage({
    params,
}: PropertyPageProps) {
    await requireUser();

    const { propertyId: propertyIdParam } = await params;
    const propertyId = Number(propertyIdParam);

    if (!Number.isInteger(propertyId) || propertyId <= 0) {
        notFound();
    }

    const property = await getProperty(propertyId);
    if (!property) {
        notFound();
    }

    const address = `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`;
    const details = sampleDetails(address, property.city, property.purchase_price);

    return (
        <div className="mx-auto w-full min-w-0 max-w-5xl px-6 py-10">
            <section className="py-2">
                <h1 className="text-5xl font-semibold tracking-tight">{property.nickname}</h1>
            </section>

            <section className="py-2">
                <h2 className="sr-only">Quick details</h2>
                <ul className="flex max-w-md flex-col gap-2.5 text-md">
                    {details.map((detail) => (
                        <li key={detail.label} className="flex items-baseline gap-3">
                            <span aria-hidden="true" className="w-6 shrink-0 text-base leading-5">
                                {detail.emoji}
                            </span>
                            <span className="min-w-0">
                                <span className="font-bold text-zinc-900">{detail.label}</span>
                                <span className="mt-0.5 block font-medium text-zinc-900">
                                    {detail.value}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="py-2">
                <Button nativeButton={false} render={
                    <Link href={`/properties/${property.id}/view?month=${DEFAULT_DASHBOARD_MONTH}`} />
                }>
                    View monthly
                </Button>
            </section>
        </div>
    );
}