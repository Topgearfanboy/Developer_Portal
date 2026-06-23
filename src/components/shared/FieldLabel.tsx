"use client";

import { FieldTooltip } from "./FieldTooltip";

interface FieldLabelProps {
  label: string;
  tooltip?: string;
  size?: "sm" | "xs";
  className?: string;
  children?: React.ReactNode;
}

export function FieldLabel({
  label,
  tooltip,
  size = "sm",
  className = "",
  children,
}: FieldLabelProps) {
  const sizeClass = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${sizeClass} font-medium text-text-muted mb-1 ${className}`}>
      <span>{label}</span>
      {tooltip && (
        <span onClick={(e) => e.stopPropagation()}>
          <FieldTooltip text={tooltip} />
        </span>
      )}
      {children}
    </div>
  );
}
