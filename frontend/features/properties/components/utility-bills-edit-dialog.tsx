// features/dashboard/components/utility-bills-edit-dialog.tsx

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
  updateUtilityBills,
  type UpdateUtilityBillState,
} from "@/features/properties/actions";
import type { DashboardData } from "@/features/properties/queries";

type UtilityBill = DashboardData["utilityBills"][number];

type UtilityBillsEditDialogProps = {
  utilityBills: UtilityBill[];
};

export function UtilityBillsEditDialog({
  utilityBills,
}: UtilityBillsEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    UpdateUtilityBillState,
    FormData
  >(updateUtilityBills, null);

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
        Edit Bills
      </DialogTrigger>

      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit utility bills</DialogTitle>
          <DialogDescription>
            Update amounts for every bill this month.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex mx-auto w-full flex-col gap-4">
          {utilityBills.map((bill) => {
            const account = bill.utility_account;

            return (
              <div key={bill.id} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={bill.id} />
                <Label htmlFor={`amount-${bill.id}`}>
                  {account.name} · {account.utility_category.display_name} ·{" "}
                  {account.property.nickname}
                </Label>
                <Input
                  key={`${bill.id}-${bill.amount}`}
                  id={`amount-${bill.id}`}
                  name={`amount_${bill.id}`}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  defaultValue={bill.amount}
                  disabled={pending}
                />
              </div>
            );
          })}

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