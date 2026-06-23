"use client";

import { FieldTooltip } from "@/components/shared/FieldTooltip";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  label: string;
  tooltip?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({
  name,
  label,
  tooltip,
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <div>
      <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
        {label}
        {tooltip && <FieldTooltip text={tooltip} />}
      </label>
      <div className="flex gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
