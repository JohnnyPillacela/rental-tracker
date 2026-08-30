// page.tsx

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_NAME, CONTACT_EMAIL } from "@/lib/brand";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const user = await supabase.auth
    .getUser()
    .then(({ data, error }) => (error ? null : data.user))
    .catch(() => null);

  const ctaHref = user ? "/dashboard" : "/login";
  const ctaLabel = user ? "Dashboard" : "Sign in";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-medium tracking-tight">
            {PRODUCT_NAME}
          </Link>
          <Button nativeButton={false} render={<Link href={ctaHref} />} size="sm">
            {ctaLabel}
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <p className="text-sm text-muted-foreground">
            Private landlords with more than one property. Also used by small
            operators.
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            See which units paid this month — across every building.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Rent and utilities, by month, by property. Not a tenant app. Not a
            full property-management suite.
          </p>
          <Button
            className="mt-8"
            nativeButton={false}
            render={<Link href={ctaHref} />}
            size="lg"
          >
            {ctaLabel}
          </Button>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Still in beta. The first 10 accounts are free for life. Access is
            not self-serve — email{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>{" "}
            for an account.
          </p>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:gap-16">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                For
              </h2>
              <p className="mt-3 text-lg">
                You already own more than one property — or you run a small shop
                with a handful of buildings — and you need this month’s rent and
                utilities in one place.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Not for
              </h2>
              <p className="mt-3 text-lg">
                Tenants, a single house that only needs a lease template, or a
                suite with screening, portals, and work orders.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="grid gap-10 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium">Pick a property</h2>
                <p className="mt-2 text-muted-foreground">
                  Open a building from your list.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-medium">Open the month</h2>
                <p className="mt-2 text-muted-foreground">
                  Move to this month or last month.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-medium">Record rent and utilities</h2>
                <p className="mt-2 text-muted-foreground">
                  Mark what was paid and log the bills.
                </p>
              </div>
            </div>
            <Button
              className="mt-12"
              nativeButton={false}
              render={<Link href={ctaHref} />}
              size="lg"
            >
              {ctaLabel}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
          Ran by an ex-Google and ex-Amazon engineer.
        </p>
      </footer>
    </div>
  );
}
