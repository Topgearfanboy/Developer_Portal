"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`w-full h-[calc(100vh-200px)] min-h-100 flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-border/60 ${className}`}
    >
      <div className="text-center space-y-6 p-8">
        {icon && (
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <p className="text-text-muted max-w-md mx-auto">{description}</p>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
