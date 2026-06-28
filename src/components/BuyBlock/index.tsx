import { useState } from "react";
import type { BuyBlockData } from "../../types";
import { TextField } from "../uiComponents/fieldTypes/TextField";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { PercentageField } from "../uiComponents/fieldTypes/PercentageField";
import { LabeledCurrencyOrPercentageField } from "../shared/LabeledCurrencyOrPercentageField";
import { ButtonGroup } from "../uiComponents/ButtonGroup";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import { CollapsibleSection } from "../uiComponents/CollapsibleSection";
import { CheckboxField } from "../shared/CheckboxField";
import { FieldLabel } from "../shared/FieldLabel";
import { MonthlyPaymentSummary } from "../shared/MonthlyPaymentSummary";
import {
  handleDownpaymentTypeChange,
  handleClosingCostsTypeChange,
  handlePropertyTaxesTypeChange,
  handleHomeownersInsuranceTypeChange,
  calculatePurchaseSummary,
} from "./helpers";

interface BuyBlockProps {
  data: BuyBlockData;
  onChange: (data: BuyBlockData) => void;
}

export function BuyBlock({ data, onChange }: BuyBlockProps) {
  const [projectPlanningExpanded, setProjectPlanningExpanded] = useState(false);
  const [purchaseSummaryExpanded, setPurchaseSummaryExpanded] = useState(false);

  const updateField = <K extends keyof BuyBlockData>(
    field: K,
    value: BuyBlockData[K],
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateLoanAnalysis = <K extends keyof BuyBlockData["loanAnalysis"]>(
    field: K,
    value: BuyBlockData["loanAnalysis"][K],
  ) => {
    onChange({
      ...data,
      loanAnalysis: { ...data.loanAnalysis, [field]: value },
    });
  };

  return (
    <div data-testid="buy-block" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Cost"
          value={data.cost}
          onChange={(value) => updateField("cost", value)}
          data-testid="buy-cost"
        />
        <PercentageField
          label="Interest Rate"
          value={data.interestRate}
          onChange={(value) => updateField("interestRate", value)}
          data-testid="buy-interest-rate"
        />
        <LabeledCurrencyOrPercentageField
          label="Downpayment"
          value={data.downpayment}
          type={data.downpaymentType}
          onChange={(value) => updateField("downpayment", value)}
          onTypeChange={(type) =>
            handleDownpaymentTypeChange(data, onChange, type)
          }
          data-testid="buy-downpayment"
        />

        <LabeledCurrencyOrPercentageField
          label="Closing Costs"
          tooltip="Fees paid at closing, typically 2–5% of the purchase price. Includes lender fees, title insurance, escrow, and other transaction costs."
          value={data.closingCosts}
          type={data.closingCostsType}
          onChange={(value) => updateField("closingCosts", value)}
          onTypeChange={(type) =>
            handleClosingCostsTypeChange(data, onChange, type)
          }
          data-testid="buy-closing-costs"
        />
      </div>

      <ButtonGroup
        label="Loan Term"
        value={data.loanTerm}
        onChange={(value) => {
          onChange({
            ...data,
            loanTerm: value,
            customLoanTerm: value === "custom" ? data.customLoanTerm : value,
          });
        }}
        data-testid="buy-loan-term"
        options={[
          { value: "10", label: "10" },
          { value: "15", label: "15" },
          { value: "30", label: "30" },
          { value: "custom", label: "Custom" },
        ]}
      />

      {data.loanTerm === "custom" && (
        <TextField
          label="Years"
          value={data.customLoanTerm}
          onChange={(value) => updateField("customLoanTerm", value)}
          placeholder="e.g., 20"
          data-testid="buy-custom-loan-term"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="max-w-[200px] w-full">
          <LabeledCurrencyOrPercentageField
            label="Property Taxes"
            value={data.propertyTaxes}
            type={data.propertyTaxesType}
            onChange={(value) => updateField("propertyTaxes", value)}
            onTypeChange={(type) =>
              handlePropertyTaxesTypeChange(data, onChange, type)
            }
            data-testid="buy-property-taxes"
          />
        </div>

        <div>
          <FieldLabel
            label="HOA (Annual)"
            tooltip="Homeowners Association fee charged annually. Covers shared amenities and community maintenance. Enter 0 if not applicable."
          />
          <CurrencyField
            value={data.annualHoa}
            onChange={(value) => updateField("annualHoa", value)}
            data-testid="buy-annual-hoa"
          />
        </div>

        <div className="max-w-[200px] w-full">
          <LabeledCurrencyOrPercentageField
            label="Insurance (Annual)"
            value={data.homeownersInsurance}
            type={data.homeownersInsuranceType}
            onChange={(value) => updateField("homeownersInsurance", value)}
            onTypeChange={(type) =>
              handleHomeownersInsuranceTypeChange(data, onChange, type)
            }
            data-testid="buy-insurance"
          />
        </div>
      </div>

      <CheckboxField
        id="interestOnly"
        label="Interest Only Option"
        checked={data.interestOnlyOption}
        onChange={(checked) => updateField("interestOnlyOption", checked)}
        tooltip="When enabled, your monthly payment covers only the interest — no principal is paid down. This lowers monthly payments but builds no equity through repayment."
        data-testid="buy-interest-only"
      />

      {/* Purchase Summary with always-visible Monthly Payment */}
      {(() => {
        const summary = calculatePurchaseSummary(data);
        const {
          costNum,
          downpaymentNum,
          closingNum,
          loanAmount,
          totalCashNeeded,
          principalAndInterest,
          propertyTaxes,
          homeownersInsurance,
          hoa,
          totalMonthlyPayment,
        } = summary;

        return (
          <div className="bg-bg rounded-lg p-4 space-y-3">
            <button
              type="button"
              onClick={() =>
                setPurchaseSummaryExpanded(!purchaseSummaryExpanded)
              }
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-semibold text-text">Purchase Summary</h4>
              <svg
                className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                  purchaseSummaryExpanded ? "rotate-180" : ""
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

            <MonthlyPaymentSummary
              totalMonthlyPayment={totalMonthlyPayment}
              principalAndInterest={principalAndInterest}
              propertyTaxes={propertyTaxes}
              homeownersInsurance={homeownersInsurance}
              hoa={hoa}
            />

            {/* Collapsible Details */}
            {purchaseSummaryExpanded && (
              <div className="space-y-2">
                <AnalysisItem
                  label="Purchase Price"
                  value={
                    costNum > 0
                      ? `$${costNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Loan Amount"
                  value={
                    loanAmount > 0
                      ? `$${loanAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Down Payment"
                  value={
                    downpaymentNum > 0
                      ? `$${downpaymentNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Closing Costs"
                  value={
                    closingNum > 0
                      ? `$${closingNum.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Total Cash Needed"
                  value={
                    totalCashNeeded > 0
                      ? `$${totalCashNeeded.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "-"
                  }
                  highlight
                />
              </div>
            )}
          </div>
        );
      })()}

      <CollapsibleSection
        title="Project Planning"
        expanded={projectPlanningExpanded}
        onToggle={() => setProjectPlanningExpanded(!projectPlanningExpanded)}
      >
        <div className="grid grid-cols-2 gap-3">
          <CurrencyField
            label="Income Needed"
            value={data.loanAnalysis.incomeNeeded}
            onChange={(value) => updateLoanAnalysis("incomeNeeded", value)}
            size="sm"
            data-testid="buy-income-needed"
          />
          <div>
            <FieldLabel
              label="Max Loan Based on ARV"
              tooltip="The maximum loan a lender will offer based on the After Repair Value (ARV) of the property — typically 70–75% of ARV for investment properties."
              size="xs"
            />
            <CurrencyField
              value={data.loanAnalysis.maxLoanBasedOnArv}
              onChange={(value) =>
                updateLoanAnalysis("maxLoanBasedOnArv", value)
              }
              size="sm"
              data-testid="buy-max-loan-arv"
            />
          </div>
          <CurrencyField
            label="Initial Cash"
            value={data.loanAnalysis.initialCash}
            onChange={(value) => updateLoanAnalysis("initialCash", value)}
            size="sm"
            data-testid="buy-initial-cash"
          />
          <div>
            <FieldLabel
              label="Saved For Renovation"
              tooltip="Cash you have set aside specifically for renovation costs, separate from your down payment and closing costs."
              size="xs"
            />
            <CurrencyField
              value={data.loanAnalysis.savedForRenovation}
              onChange={(value) =>
                updateLoanAnalysis("savedForRenovation", value)
              }
              size="sm"
              data-testid="buy-saved-renovation"
            />
          </div>
          <div className="col-span-2">
            <CurrencyField
              label="Minimum Cash For Project"
              value={data.loanAnalysis.minimumCashForProject}
              onChange={(value) =>
                updateLoanAnalysis("minimumCashForProject", value)
              }
              size="sm"
              data-testid="buy-minimum-cash"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
