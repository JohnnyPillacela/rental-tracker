// features/dashboard/components/rent-records-table.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardData } from "@/features/dashboard/queries";
import { formatCurrency } from "../format";
import { Database } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";
import { RentRecordRow } from "./rent-record-row";

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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentRecords.map((rentRecord) => {
                            return <RentRecordRow key={rentRecord.id} rentRecord={rentRecord} />;
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}