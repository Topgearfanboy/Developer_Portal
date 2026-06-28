interface ButtonGroupOption {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ButtonGroupOption[];
  "data-testid"?: string;
}

export function ButtonGroup({
  label,
  value,
  onChange,
  options,
  "data-testid": dataTestId,
}: ButtonGroupProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-muted mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            data-testid={
              dataTestId ? `${dataTestId}-${option.value}` : undefined
            }
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              value === option.value
                ? "bg-primary text-white"
                : "bg-white border border-border text-text-muted hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
