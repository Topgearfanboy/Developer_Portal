"use client";

import { useEffect, useRef } from "react";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  dotColor?: string;
  dataTestId?: string;
}

interface DropdownMenuProps {
  options: DropdownOption[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenu({
  options,
  onSelect,
  isOpen,
  onOpenChange,
  children,
}: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onOpenChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      {children}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              data-testid={option.dataTestId}
              onClick={() => {
                onSelect(option.value);
                onOpenChange(false);
              }}
              disabled={option.disabled}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {option.dotColor && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: option.dotColor }}
                />
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
