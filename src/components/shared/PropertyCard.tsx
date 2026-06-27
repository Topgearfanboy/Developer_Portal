"use client";

import Link from "next/link";

interface PropertyCardProps {
  name: string;
  location?: string;
  blockCount: number;
  createdAt?: string;
  onDelete?: () => void;
  href: string;
}

export function PropertyCard({
  name,
  location,
  blockCount,
  createdAt,
  onDelete,
  href,
}: PropertyCardProps) {
  return (
    <div
      data-testid="property-card"
      className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-lg hover:border-primary/50 transition-all group relative"
    >
      {onDelete && (
        <button
          data-testid="delete-property-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          aria-label="Delete property"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <Link href={href} className="block">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 5h4"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text mb-1 group-hover:text-primary transition-colors">
          {name}
        </h2>
        {(location || createdAt) && (
          <p className="text-sm text-text-muted mb-3">
            {location || ""}
            {location && createdAt && " · "}
            {createdAt && `Created: ${createdAt}`}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-text-muted">
            {blockCount} block{blockCount !== 1 ? "s" : ""}
          </span>
          <span className="text-xs font-medium text-primary">View →</span>
        </div>
      </Link>
    </div>
  );
}
