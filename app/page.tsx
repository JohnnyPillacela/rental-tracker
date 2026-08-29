// page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const user = await supabase.auth
    .getUser()
    .then(({ data, error }) => (error ? null : data.user))
    .catch(() => null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="rounded-md bg-zinc-900 px-4 py-2 text-white"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <h1>
            Rental Tracker
          </h1>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          Number of properties
        </div>
      </main>
    </div>
  );
}
