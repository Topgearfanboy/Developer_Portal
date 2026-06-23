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
      <div className="flex items-center justify-between w-full gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-1 text-left flex-1 min-w-0"
        >
          <h4 className="font-semibold text-text">{title}</h4>
        </button>
        {tooltip && (
          <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <FieldTooltip text={tooltip} />
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-text-muted hover:text-text transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
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
      </div>
      {expanded && <div className="w-full mt-3">{children}</div>}
    </div>
  );
}
