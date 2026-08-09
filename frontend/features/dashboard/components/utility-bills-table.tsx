// features/dashboard/components/utility-bills-table.tsx
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/features/dashboard/format";
import type { DashboardData } from "@/features/dashboard/queries";

type UtilityBillsTableProps = {
    utilityBills: DashboardData["utilityBills"];
};

export function UtilityBillsTable({ utilityBills }: UtilityBillsTableProps) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Utility Bills</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {utilityBills.map((bill) => 
                        {
                            const account = bill.utility_account;
                            const accountName = account.name;
                            const categoryName = account.utility_category.display_name;
                            const propertyName = account.property.nickname;
                            const amount = formatCurrency(bill.amount);
                            const notes = bill.notes ?? "";
                            return (
                                <TableRow key={bill.id}>
                                    <TableCell>{accountName}</TableCell>
                                    <TableCell>{categoryName}</TableCell>
                                    <TableCell>{propertyName}</TableCell>
                                    <TableCell>{amount}</TableCell>
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


