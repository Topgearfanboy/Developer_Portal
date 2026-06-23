"use client";

import { FieldLabel } from "./FieldLabel";
import { CurrencyOrPercentageField } from "@/components/uiComponents/fieldTypes/CurrencyOrPercentageField";

interface LabeledCurrencyOrPercentageFieldProps {
  label: string;
  tooltip?: string;
  value: string;
  type: "$" | "%";
  onChange: (value: string) => void;
  onTypeChange: (type: "$" | "%") => void;
  width?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export function LabeledCurrencyOrPercentageField({
  label,
  tooltip,
  value,
  type,
  onChange,
  onTypeChange,
  width = "w-full",
  disabled = false,
  "data-testid": dataTestId,
}: LabeledCurrencyOrPercentageFieldProps) {
  return (
    <div>
      <FieldLabel label={label} tooltip={tooltip} />
      <div className={width}>
        <CurrencyOrPercentageField
          value={value}
          type={type}
          onChange={onChange}
          onTypeChange={onTypeChange}
          disabled={disabled}
          data-testid={dataTestId}
        />
      </div>
    </div>
  );
}
