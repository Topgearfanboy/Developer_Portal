import { FormInput } from "@/components/shared/FormInput";
import { FieldTooltip } from "@/components/shared/FieldTooltip";

interface ProjectSettingsPanelProps {
  idealCashHoldingBalance: string;
  onCashBalanceChange: (balance: string) => void;
  estimatedHomeAppreciationRate: string;
  onAppreciationRateChange: (rate: string) => void;
  purchaseDate: string;
  onPurchaseDateChange: (date: string) => void;
  cashStrategy: "profit" | "paydown";
  onCashStrategyChange: (strategy: "profit" | "paydown") => void;
}

export function ProjectSettingsPanel({
  idealCashHoldingBalance,
  onCashBalanceChange,
  estimatedHomeAppreciationRate,
  onAppreciationRateChange,
  purchaseDate,
  onPurchaseDateChange,
  cashStrategy,
  onCashStrategyChange,
}: ProjectSettingsPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
        Project Settings
      </h3>
      <div className="flex items-center gap-4">
        {cashStrategy === "paydown" && (
          <div className="flex items-center gap-1">
            <FormInput
              label="Holding Balance"
              type="number"
              value={idealCashHoldingBalance}
              onChange={(e) => onCashBalanceChange(e.target.value)}
              prefix="$"
              placeholder="10000"
              className="w-32"
            />
            <FieldTooltip
              text="The minimum cash balance you want to keep on hand. Surplus cash above this amount is used to pay down the loan principal."
              position="bottom"
            />
          </div>
        )}
        <div className="flex items-center gap-1">
          <FormInput
            label="Appreciation"
            type="number"
            value={estimatedHomeAppreciationRate}
            onChange={(e) => onAppreciationRateChange(e.target.value)}
            suffix="%"
            placeholder="3"
            step="0.1"
            className="w-20"
          />
          <FieldTooltip
            text="Annual home value appreciation rate used to project property equity growth over time. Historical US average is ~3%."
            position="bottom"
          />
        </div>
        <FormInput
          label="Purchase Date"
          type="date"
          value={purchaseDate}
          onChange={(e) => onPurchaseDateChange(e.target.value)}
          className="w-36"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="cashStrategy"
              value="profit"
              checked={cashStrategy === "profit"}
              onChange={(e) =>
                onCashStrategyChange(e.target.value as "profit" | "paydown")
              }
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-xs text-text">Profit</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="cashStrategy"
              value="paydown"
              checked={cashStrategy === "paydown"}
              onChange={(e) =>
                onCashStrategyChange(e.target.value as "profit" | "paydown")
              }
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-xs text-text">Paydown</span>
          </label>
          <FieldTooltip
            text="Profit: surplus cash is kept on hand. Paydown: surplus cash above your holding balance is used to pay down the loan principal faster."
            position="bottom"
          />
        </div>
      </div>
    </div>
  );
}
