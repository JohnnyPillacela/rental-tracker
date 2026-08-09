// features/dashboard/components/month-nav.tsx

import Link from "next/link";
import { shiftMonth } from "@/features/dashboard/month";

type MonthNavProps = {
  month: string;
};

export function MonthNav({ month }: MonthNavProps) {
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);

  const linkClassName =
    "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50";

  return (
    <div className="flex items-center gap-2">
      <Link
        className={linkClassName}
        href={`/dashboard?month=${prevMonth}`}
      >
        Previous
      </Link>
      <Link
        className={linkClassName}
        href={`/dashboard?month=${nextMonth}`}
      >
        Next
      </Link>
    </div>
  );
}