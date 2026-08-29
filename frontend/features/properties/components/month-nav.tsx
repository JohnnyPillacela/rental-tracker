// features/properties/components/month-nav.tsx

import Link from "next/link";
import { shiftMonth } from "@/features/properties/month";

type MonthNavProps = {
  month: string;
  propertyId?: number;
};

export function MonthNav({ month, propertyId }: MonthNavProps) {
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const hrefFor = (targetMonth: string) =>
    propertyId !== undefined
      ? `/properties/${propertyId}?month=${targetMonth}`
      : `/dashboard?month=${targetMonth}`;

  const linkClassName =
    "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50";

  return (
    <div className="flex items-center gap-2">
      <Link
        className={linkClassName}
        href={hrefFor(prevMonth)}
      >
        Previous
      </Link>
      <Link
        className={linkClassName}
        href={hrefFor(nextMonth)}
      >
        Next
      </Link>
    </div>
  );
}