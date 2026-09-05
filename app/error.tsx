// app/error.tsx

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const LOG_APP_ERROR = "app_error";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(LOG_APP_ERROR, error.message, error.digest);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 text-zinc-600">
        This is on our side, not yours. Try again in a moment. If it keeps
        happening, share the reference below with us.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-zinc-500">{error.digest}</p>
      ) : null}
      <Button className="mt-6 w-fit" type="button" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </main>
  );
}