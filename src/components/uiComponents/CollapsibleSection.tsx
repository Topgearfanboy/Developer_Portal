import type { ReactNode } from "react";
import { FieldTooltip } from "../shared/FieldTooltip";

interface CollapsibleSectionProps {
  title: string;
  tooltip?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  tooltip,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="bg-bg rounded-lg p-4 w-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-1">
          <h4 className="font-semibold text-text">{title}</h4>
          {tooltip && (
            <span onClick={(e) => e.stopPropagation()}>
              <FieldTooltip text={tooltip} />
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && <div className="w-full mt-3">{children}</div>}
    </div>
  );
}
