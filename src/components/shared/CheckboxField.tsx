"use client";

import { FieldTooltip } from "./FieldTooltip";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  disabled?: boolean;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  tooltip,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary border-border rounded focus:ring-primary disabled:opacity-50"
      />
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {tooltip && <FieldTooltip text={tooltip} />}
    </div>
  );
}
