"use client";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">{title}</h2>
          <p className="mt-2 text-center text-gray-600">{subtitle}</p>
        </div>

        {children}

        <div className="text-center">{footer}</div>
      </div>
    </div>
  );
}
