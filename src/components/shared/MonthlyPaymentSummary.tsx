"use client";

import { AnalysisItem } from "@/components/uiComponents/AnalysisItem";
import { SegmentedProgressBar } from "@/components/uiComponents/SegmentedProgressBar";

interface MonthlyPaymentSummaryProps {
  totalMonthlyPayment: number;
  principalAndInterest: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  hoa?: number;
}

export function MonthlyPaymentSummary({
  totalMonthlyPayment,
  principalAndInterest,
  propertyTaxes,
  homeownersInsurance,
  hoa = 0,
}: MonthlyPaymentSummaryProps) {
  const totalValue =
    totalMonthlyPayment > 0
      ? `$${totalMonthlyPayment.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        })}`
      : "-";

  const segments = [
    {
      value: principalAndInterest,
      color: "bg-blue-500",
      label: "Loan",
    },
    {
      value: propertyTaxes,
      color: "bg-emerald-500",
      label: "Tax",
    },
    {
      value: homeownersInsurance,
      color: "bg-amber-500",
      label: "Insurance",
    },
  ];

  if (hoa > 0) {
    segments.push({
      value: hoa,
      color: "bg-purple-500",
      label: "HOA",
    });
  }

  return (
    <div data-testid="monthly-payment-summary">
      <AnalysisItem
        label="Monthly Payment"
        value={totalValue}
        highlight
        noBorder
      />
      <SegmentedProgressBar segments={segments} total={totalMonthlyPayment} />
    </div>
  );
}
