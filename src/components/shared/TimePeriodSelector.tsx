"use client";

import { FieldTooltip } from "./FieldTooltip";

export interface TimeUnit {
  key: string;
  label: string;
  max: number;
  optional?: boolean;
}

interface TimePeriodSelectorProps {
  label?: string;
  tooltip?: string;
  values: Record<string, string>;
  units: TimeUnit[];
  onChange: (key: string, value: string) => void;
  "data-testid"?: string;
}

export function TimePeriodSelector({
  label,
  tooltip,
  values,
  units,
  onChange,
  "data-testid": dataTestId,
}: TimePeriodSelectorProps) {
  return (
    <div>
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-text-muted mb-2">
          {label}
          {tooltip && <FieldTooltip text={tooltip} />}
        </label>
      )}
      <div className="grid grid-cols-3 gap-3">
        {units.map((unit) => (
          <div key={unit.key}>
            <label className="block text-xs text-text-muted mb-1">
              {unit.label}
            </label>
            <select
              value={values[unit.key] ?? ""}
              onChange={(e) => onChange(unit.key, e.target.value)}
              data-testid={dataTestId ? `${dataTestId}-${unit.key}` : undefined}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              {unit.optional && <option value="">0</option>}
              {Array.from({ length: unit.max }, (_, i) => {
                const value = unit.optional ? (i + 1).toString() : i.toString();
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
