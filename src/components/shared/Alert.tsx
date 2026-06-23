"use client";

interface AlertProps {
  variant?: "error" | "success" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  error: "bg-red-50 border-red-200 text-red-600",
  success: "bg-green-50 border-green-200 text-green-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

export function Alert({
  variant = "error",
  title,
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`p-4 border rounded-lg ${variantClasses[variant]} ${className}`}
    >
      {title && <p className="font-medium mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
