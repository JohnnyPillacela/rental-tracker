// features/dashboard/components/rent-records-table.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardData } from "@/features/dashboard/queries";
import { formatCurrency } from "../format";
import { Database } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";

type RentRecordsTableProps = {
  rentRecords: DashboardData["rentRecords"];
};

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

export function RentRecordsTable({ rentRecords }: RentRecordsTableProps) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Rent</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rental Space</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expected</TableHead>
                            <TableHead>Collected</TableHead>
                            <TableHead>Unpaid</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentRecords.map((rentRecord) => {
                            const spaceName = rentRecord.rental_space.name;
                            const unitName = rentRecord.rental_space.unit.name;
                            const propertyNickname = rentRecord.rental_space.unit.property.nickname;
                            const status = rentRecord.status;
                            const expected = formatCurrency(rentRecord.expected_amount);
                            const collected = formatCurrency(rentRecord.collected_amount);
                            const unpaid = formatCurrency(Math.max(0, rentRecord.expected_amount - rentRecord.collected_amount));
                            const notes = rentRecord.notes ?? "";

                            return (
                                <TableRow key={rentRecord.id}>
                                    <TableCell>{spaceName}</TableCell>
                                    <TableCell>{unitName}</TableCell>
                                    <TableCell>{propertyNickname}</TableCell>
                                    <TableCell><RentStatusBadge status={status} /></TableCell>
                                    <TableCell>{expected}</TableCell>
                                    <TableCell>{collected}</TableCell>
                                    <TableCell>{unpaid}</TableCell>
                                    <TableCell>{notes}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}