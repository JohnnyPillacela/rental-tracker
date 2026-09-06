// features/properties/components/add-property-form.tsx

"use client";

import { useActionState, useEffect, useState } from "react";
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
import { addProperty, type AddPropertyState } from "../actions";
import { PlusIcon } from "lucide-react";

export function AddPropertyDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction, pending] = useActionState<AddPropertyState, FormData>(
        addProperty,
        null,
    );

    useEffect(() => {
        if (state?.ok) setOpen(false);
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button type="button" size="lg" variant="outline"/>}>
                <PlusIcon className="h-4 w-4" />
                Add property
            </DialogTrigger>

            <DialogContent className="max-w-lg sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add property</DialogTitle>
                    <DialogDescription>
                        Rent, utilities, and mortgage can be filled in later.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="flex w-full flex-col gap-4">
                    {/* nickname, address, city + state row, zip + unit_count row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="nickname">Nickname</Label>
                            <Input type="text" name="nickname" id="nickname" />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input type="text" name="address" id="address" />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="city">City</Label>
                            <Input type="text" name="city" id="city" />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="state">State</Label>
                            <Input type="text" name="state" id="state" />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="zip">Zip</Label>
                            <Input type="text" name="zip" id="zip" />
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="unit_count">Unit Count</Label>
                            <Input type="number" name="unit_count" id="unit_count" />
                        </div>
                    </div>

                    {state?.ok === false ? (
                        <p aria-live="polite" role="alert" className="text-sm text-destructive">
                            {state.error}
                        </p>
                    ) : null}

                    <DialogFooter className="px-0">
                        <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Adding…" : "Add property"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}