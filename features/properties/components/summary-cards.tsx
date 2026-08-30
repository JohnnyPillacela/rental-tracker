// features/properties/components/summary-cards.tsx

import type { ReactNode } from "react";
import type { DashboardSummary } from "@/features/properties/summary";
import { formatCurrency, formatInterestRate } from "@/features/properties/format";
import { cn } from "@/lib/utils";

type SummaryCardsProps = {
  summary: DashboardSummary;
};

function MetricGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <dl className="mt-2 divide-y border-t">{children}</dl>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right">
        <p
          className={cn(
            "font-semibold tabular-nums tracking-tight",
            emphasize && "text-destructive",
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </dd>
    </div>
  );
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="mt-8 grid gap-8 sm:grid-cols-2">
      <MetricGroup title="Rent">
        <Metric label="Expected" value={formatCurrency(summary.expectedRent)} />
        <Metric
          label="Collected"
          value={formatCurrency(summary.collectedRent)}
        />
        <Metric
          label="Tenant overdue"
          value={formatCurrency(summary.tenantOverdue)}
          emphasize={summary.tenantOverdue > 0}
        />
        <Metric
          label="Vacancy loss"
          value={formatCurrency(summary.vacancyLoss)}
          emphasize={summary.vacancyLoss > 0}
        />
      </MetricGroup>

      <MetricGroup title="Costs">
        <Metric
          label="Utilities"
          value={formatCurrency(summary.utilityExpenses)}
        />
        <Metric
          label="Mortgage"
          value={formatCurrency(summary.mortgagePayment)}
          hint={
            summary.interestRate === null
              ? undefined
              : `${formatInterestRate(summary.interestRate)} interest`
          }
        />
      </MetricGroup>
    </div>
  );
}
