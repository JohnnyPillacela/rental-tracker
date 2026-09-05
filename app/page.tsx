// page.tsx

import { Button } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/supabase/server";
import { PRODUCT_NAME, CONTACT_EMAIL } from "@/lib/brand";
import Link from "next/link";

export default async function Home() {
  const user = await getOptionalUser();

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
            {PRODUCT_NAME} — rental management made simple.
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Property management built for independent landlords.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {PRODUCT_NAME} helps small landlords understand exactly how each
            rental is performing — rent, vacancies, utilities, expenses,
            mortgage, and cash flow — without the complexity of traditional
            property-management software.
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
              <h2 className="text-lg font-medium">A good fit</h2>
              <p className="mt-3 text-lg">
                Independent landlords and solo operators who want a clear
                picture of each property: what came in, what went out, and what
                is left. Plenty of people start by house hacking — living in one
                room and renting out the rest.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-medium">Not a good fit</h2>
              <p className="mt-3 text-lg">
                Tenants, apartment complexes, or teams that need screening,
                work-order portals, and a full property-management suite.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="grid gap-10 sm:grid-cols-3">
              <div>
                <h2 className="text-lg font-medium">See each property</h2>
                <p className="mt-2 text-muted-foreground">
                  Open a building and read rent, vacancies, and cash flow at a
                  glance.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-medium">Track the month</h2>
                <p className="mt-2 text-muted-foreground">
                  Record what was paid, what is vacant, and what the bills were.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-medium">Know the numbers</h2>
                <p className="mt-2 text-muted-foreground">
                  Utilities, expenses, mortgage, and cash flow — without extra
                  software.
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
