// features/dashboard/components/rent-records-table.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardData } from "@/features/dashboard/queries";
import { RentRecordRow } from "./rent-record-row";

type RentRecordsTableProps = {
  rentRecords: DashboardData["rentRecords"];
};

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