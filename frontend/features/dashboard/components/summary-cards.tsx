// features/dashboard/components/summary-cards.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSummary } from "@/features/dashboard/summary";
import { formatCurrency } from "@/features/dashboard/format";

type SummaryCardsProps = {
  summary: DashboardSummary;
};

const METRICS: {
  key: keyof DashboardSummary;
  label: string;
}[] = [
  { key: "expectedRent", label: "Expected rent" },
  { key: "collectedRent", label: "Collected rent" },
  { key: "tenantOverdue", label: "Tenant overdue" },
  { key: "vacancyLoss", label: "Vacancy loss" },
  { key: "utilityExpenses", label: "Utility expenses" },
  { key: "mortgagePayment", label: "Mortgage" },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {METRICS.map(({ key, label }) => (
        <Card key={key} size="sm" className="p-2 text-left">
          <CardHeader>
            <CardTitle className="text-zinc-500">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight text-zinc-900">
              {formatCurrency(summary[key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
