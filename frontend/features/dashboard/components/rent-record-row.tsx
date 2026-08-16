// features/dashboard/components/rent-record-row.tsx

import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/features/dashboard/format";
import type { DashboardData } from "@/features/dashboard/queries";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_VARIANT, RentStatus } from "@/features/dashboard/rent-status";
import { RentRecordEditSheet } from "./rent-record-edit-sheet";

type RentRecord = DashboardData["rentRecords"][number];

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
  const space = rentRecord.rental_space;
  const unpaid = Math.max(
    0,
    rentRecord.expected_amount - rentRecord.collected_amount,
  );

  return (
    <TableRow>
      {/* hidden form element — fields associate via form={formId} */}
      <TableCell>
        <RentRecordEditSheet rentRecord={rentRecord} />
      </TableCell>

      <TableCell>{space.name}</TableCell>
      <TableCell>{space.unit.name}</TableCell>
      <TableCell>{space.unit.property.nickname}</TableCell>

      <TableCell>
        <RentStatusBadge status={rentRecord.status} />
      </TableCell>

      <TableCell>{formatCurrency(rentRecord.expected_amount)}</TableCell>

      <TableCell>
        {formatCurrency(rentRecord.collected_amount)}
      </TableCell>

      <TableCell>{formatCurrency(unpaid)}</TableCell>
      <TableCell>{rentRecord.notes ?? ""}</TableCell>

    </TableRow>
  );
}