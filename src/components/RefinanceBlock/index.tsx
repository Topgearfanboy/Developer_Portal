import { useState } from "react";
import type { RefinanceBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { PercentageField } from "../uiComponents/fieldTypes/PercentageField";
import { LabeledCurrencyOrPercentageField } from "../shared/LabeledCurrencyOrPercentageField";
import { CollapsibleSection } from "../uiComponents/CollapsibleSection";
import { ButtonGroup } from "../uiComponents/ButtonGroup";
import { RadioGroup } from "../uiComponents/RadioGroup";
import { CheckboxField } from "../shared/CheckboxField";
import { MonthlyPaymentSummary } from "../shared/MonthlyPaymentSummary";
import {
  updateField,
  handleCostTypeChange,
  handleClosingCostsTypeChange,
  handlePropertyTaxesTypeChange,
  handleHomeownersInsuranceTypeChange,
  calculateRefinancePaymentSummary,
} from "./helpers";

interface RefinanceBlockProps {
  data: RefinanceBlockData;
  onChange: (data: RefinanceBlockData) => void;
}

export function RefinanceBlock({ data, onChange }: RefinanceBlockProps) {
  const [remainingEquityExpanded, setRemainingEquityExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <RadioGroup
        name="cashOut"
        label="Refinance Type"
        tooltip="Non Cash-out: replaces your loan at a better rate. Cash Out: takes out a new, larger loan and receives the difference in cash, pulling equity from the property."
        options={[
          { value: "false", label: "Non Cash-out" },
          { value: "true", label: "Cash Out" },
        ]}
        value={data.cashOut ? "true" : "false"}
        onChange={(value) =>
          updateField(data, onChange, "cashOut", value === "true")
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Estimated Value"
          value={data.estimatedValue}
          onChange={(value) =>
            updateField(data, onChange, "estimatedValue", value)
          }
          data-testid="refinance-estimated-value"
        />

        <PercentageField
          label="Interest Rate"
          value={data.interestRate}
          onChange={(value) =>
            updateField(data, onChange, "interestRate", value)
          }
          data-testid="refinance-interest-rate"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LabeledCurrencyOrPercentageField
          label="Financed Amount"
          tooltip="The total loan amount on the refinanced property. For Cash Out refinances this is typically 75–80% of the estimated value."
          value={data.cost}
          type={data.costType}
          onChange={(value) => updateField(data, onChange, "cost", value)}
          onTypeChange={(type) => handleCostTypeChange(data, onChange, type)}
          disabled={!data.cashOut}
          data-testid="refinance-financed-amount"
        />

        <LabeledCurrencyOrPercentageField
          label="Closing Costs"
          value={data.closingCosts}
          type={data.closingCostsType}
          onChange={(value) =>
            updateField(data, onChange, "closingCosts", value)
          }
          onTypeChange={(type) =>
            handleClosingCostsTypeChange(data, onChange, type)
          }
        />
      </div>

      <ButtonGroup
        label="Loan Term"
        options={[
          { value: "30", label: "30" },
          { value: "20", label: "20" },
          { value: "15", label: "15" },
          { value: "10", label: "10" },
          { value: "custom", label: "Custom" },
        ]}
        value={data.loanTerm}
        onChange={(value) => updateField(data, onChange, "loanTerm", value)}
      />
      {data.loanTerm === "custom" && (
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Years
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={data.customLoanTerm}
            onChange={(e) =>
              updateField(
                data,
                onChange,
                "customLoanTerm",
                e.target.value.replace(/[^0-9]/g, ""),
              )
            }
            placeholder="Enter years"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <LabeledCurrencyOrPercentageField
          label="Property Taxes (Annual)"
          value={data.propertyTaxes}
          type={data.propertyTaxesType}
          onChange={(value) =>
            updateField(data, onChange, "propertyTaxes", value)
          }
          onTypeChange={(type) =>
            handlePropertyTaxesTypeChange(data, onChange, type)
          }
        />

        <LabeledCurrencyOrPercentageField
          label="Insurance (Annual)"
          value={data.homeownersInsurance}
          type={data.homeownersInsuranceType}
          onChange={(value) =>
            updateField(data, onChange, "homeownersInsurance", value)
          }
          onTypeChange={(type) =>
            handleHomeownersInsuranceTypeChange(data, onChange, type)
          }
        />
      </div>

      <CheckboxField
        id="interestOnly"
        label="Interest Only Loan"
        checked={data.interestOnlyOption}
        onChange={(checked) =>
          updateField(data, onChange, "interestOnlyOption", checked)
        }
        tooltip="When enabled, your monthly payment covers only the interest — no principal is paid down. This lowers monthly payments but builds no equity through repayment."
      />

      {/* Monthly Payment */}
      {(() => {
        const summary = calculateRefinancePaymentSummary(data);
        const {
          principalAndInterest,
          propertyTaxes,
          homeownersInsurance,
          totalMonthlyPayment,
        } = summary;

        return (
          <div className="bg-bg rounded-lg p-4 space-y-3">
            <MonthlyPaymentSummary
              totalMonthlyPayment={totalMonthlyPayment}
              principalAndInterest={principalAndInterest}
              propertyTaxes={propertyTaxes}
              homeownersInsurance={homeownersInsurance}
            />
          </div>
        );
      })()}

      <CollapsibleSection
        title="Remaining Equity"
        tooltip="The equity you retain after the refinance — i.e., the difference between the property's estimated value and the new loan amount."
        expanded={remainingEquityExpanded}
        onToggle={() => setRemainingEquityExpanded(!remainingEquityExpanded)}
      >
        <div className="grid grid-cols-2 gap-3">
          <CurrencyField
            label="Amount ($)"
            value={data.remainingEquityAmount}
            onChange={(value) =>
              updateField(data, onChange, "remainingEquityAmount", value)
            }
            size="sm"
          />
          <PercentageField
            label="Percentage (%)"
            value={data.remainingEquityPercent}
            onChange={(value) =>
              updateField(data, onChange, "remainingEquityPercent", value)
            }
            size="sm"
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
