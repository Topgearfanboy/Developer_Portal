"use client";

import type { ButtonHTMLAttributes } from "react";

type IconButtonVariant = "default" | "danger";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  label: string;
}

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    "text-text-muted hover:text-text hover:bg-gray-100",
  danger:
    "text-danger hover:bg-red-50",
};

export function IconButton({
  variant = "default",
  label,
  children,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
