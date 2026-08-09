// features/dashboard/components/rent-record-row.tsx

"use client";

import { useActionState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/features/dashboard/format";
import {
  updateRentRecord,
  type UpdateRentRecordState,
} from "@/features/dashboard/actions";
import type { DashboardData } from "@/features/dashboard/queries";
import type { Database } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";

type RentRecord = DashboardData["rentRecords"][number];
type RentStatus = Database["public"]["Enums"]["rent_status"];

const STATUS_LABEL: Record<RentStatus, string> = {
    occupied: "Occupied",
    vacant: "Vacant",
    partial_month: "Partial Month",
    nonpaying: "Non-Paying",
};

const STATUS_VARIANT: Record<
    RentStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    occupied: "default",
    vacant: "secondary",
    partial_month: "outline",
    nonpaying: "destructive",
};

function RentStatusBadge({ status }: { status: RentStatus }) {
    return (
        <Badge variant={STATUS_VARIANT[status]}>
            {STATUS_LABEL[status]}
        </Badge>
    );
}

type RentRecordRowProps = {
  rentRecord: RentRecord;
};

export function RentRecordRow({ rentRecord }: RentRecordRowProps) {
  const [state, formAction, pending] = useActionState<
    UpdateRentRecordState,
    FormData
  >(updateRentRecord, null);

  const formId = `rent-record-${rentRecord.id}`;
  const space = rentRecord.rental_space;
  const unpaid = Math.max(
    0,
    rentRecord.expected_amount - rentRecord.collected_amount,
  );

  return (
    <TableRow>
      {/* hidden form element — fields associate via form={formId} */}
      <TableCell className="hidden">
        <form id={formId} action={formAction} />
      </TableCell>

      <TableCell>{space.name}</TableCell>
      <TableCell>{space.unit.name}</TableCell>
      <TableCell>{space.unit.property.nickname}</TableCell>

      <TableCell>
        <select
          form={formId}
          name="status"
          defaultValue={rentRecord.status}
          disabled={pending}
          className="h-8 rounded-lg border border-zinc-300 bg-white px-2 text-sm"
        >
          {(Object.keys(STATUS_LABEL) as RentStatus[]).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
      </TableCell>

      <TableCell>{formatCurrency(rentRecord.expected_amount)}</TableCell>

      <TableCell>
        <input type="hidden" form={formId} name="id" value={rentRecord.id} />
        <Input
          form={formId}
          name="collected_amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={rentRecord.collected_amount}
          disabled={pending}
          className="w-28"
        />
      </TableCell>

      <TableCell>{formatCurrency(unpaid)}</TableCell>
      <TableCell>{rentRecord.notes ?? ""}</TableCell>

      <TableCell>
        <Button
          form={formId}
          type="submit"
          size="sm"
          variant="outline"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        {state?.ok === false ? (
          <p className="mt-1 text-xs text-red-600">{state.error}</p>
        ) : null}
      </TableCell>
    </TableRow>
  );
}