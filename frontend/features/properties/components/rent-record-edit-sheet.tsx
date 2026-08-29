// features/dashboard/components/rent-record-edit-sheet.tsx

"use client";

import { useEffect, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  updateRentRecord,
  type UpdateRentRecordState,
} from "@/features/properties/actions";
import { formatCurrency } from "@/features/properties/format";
import { RENT_STATUSES, STATUS_LABEL } from "@/features/properties/rent-status";
import type { DashboardData } from "@/features/properties/queries";

type RentRecord = DashboardData["rentRecords"][number];

type RentRecordEditSheetProps = {
  rentRecord: RentRecord;
};

export function RentRecordEditSheet({ rentRecord }: RentRecordEditSheetProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    UpdateRentRecordState,
    FormData
  >(updateRentRecord, null);

  const space = rentRecord.rental_space;

  // Close after successful save (revalidate runs inside the action)
  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" size="sm" variant="outline" />}
      >
        Edit
      </DialogTrigger>

      <DialogContent className="max-w-[30vw] sm:max-w-[30vw]">
        <DialogHeader className="items-center text-center">
          <DialogTitle>Edit rent</DialogTitle>
          <DialogDescription>
            {space.name} · {space.unit.name} · {space.unit.property.nickname}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex w-full flex-col gap-4">
          <input type="hidden" name="id" value={rentRecord.id} />

          <p className="text-sm text-zinc-600 text-center">
            Expected{" "}
            <span className="font-medium text-zinc-900">
              {formatCurrency(rentRecord.expected_amount)}
            </span>
          </p>

          <div className="flex w-full items-center justify-left gap-4">
            <Label htmlFor={`status-${rentRecord.id}`}>Status</Label>
            <select
              key={`${rentRecord.id}-${rentRecord.status}`}
              id={`status-${rentRecord.id}`}
              name="status"
              defaultValue={rentRecord.status}
              disabled={pending}
              className="h-10 w-1/3 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
            >
              {RENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABEL[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full items-center justify-start gap-4">
            <Label htmlFor={`collected-${rentRecord.id}`}>
              Collected amount
            </Label>
            <Input
              key={`${rentRecord.id}-${rentRecord.collected_amount}`}
              id={`collected-${rentRecord.id}`}
              name="collected_amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              defaultValue={rentRecord.collected_amount}
              disabled={pending}
              className="w-1/3"
            />
          </div>

          {state?.ok === false ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          <DialogFooter className="px-0">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
