import { useState } from "react";
import type { RenovateBlockData, RenovationItem } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { AnalysisItem } from "../uiComponents/AnalysisItem";
import { CollapsibleSection } from "../uiComponents/CollapsibleSection";
import { EditableItemList } from "../shared/EditableItemList";
import { TimePeriodSelector } from "../shared/TimePeriodSelector";
import { CheckboxField } from "../shared/CheckboxField";
import { FieldLabel } from "../shared/FieldLabel";
import {
  updateUtilities,
  updateTimeToRenovate,
  updateMonthlyCost,
  updateArv,
  calculateTotalCost,
  calculateTotalDays,
  calculateTotalRenovationCost,
} from "./helpers";

interface RenovateBlockProps {
  data: RenovateBlockData;
  onChange: (data: RenovateBlockData) => void;
  monthlyPayment?: number;
  loanOverlapMonths?: number;
}

export function RenovateBlock({
  data,
  onChange,
  monthlyPayment,
  loanOverlapMonths,
}: RenovateBlockProps) {
  const [monthlyCostExpanded, setMonthlyCostExpanded] = useState(false);
  const [renovationSummaryExpanded, setRenovationSummaryExpanded] =
    useState(false);

  return (
    <div data-testid="renovate-block" className="space-y-4">
      <EditableItemList
        items={data.items}
        onChange={(items) =>
          onChange({ ...data, items: items as RenovationItem[] })
        }
        nameField="item"
        costField="cost"
        addLabel="+ Add Item"
        emptyMessage="No items added yet"
        data-testid="renovate-items"
      />

      <TimePeriodSelector
        label="Time To Renovate"
        values={data.timeToRenovate}
        units={[
          { key: "days", label: "Days", max: 31, optional: true },
          { key: "months", label: "Months", max: 12, optional: true },
          { key: "years", label: "Years", max: 10, optional: true },
        ]}
        data-testid="renovate-time"
        onChange={(key, value) =>
          updateTimeToRenovate(
            data,
            onChange,
            key as "days" | "months" | "years",
            value,
          )
        }
      />

      <div>
        <FieldLabel
          label="After Repair Value (ARV)"
          tooltip="The estimated market value of the property after all renovations are complete. Used to determine potential equity and refinancing options."
        />
        <CurrencyField
          value={data.arv}
          onChange={(value) => updateArv(data, onChange, value)}
          placeholder="$0"
          data-testid="renovate-arv"
        />
      </div>

      <CollapsibleSection
        title="Monthly Cost To Own"
        tooltip="Ongoing monthly costs while you hold the property during renovation, such as utilities and mortgage payments."
        expanded={monthlyCostExpanded}
        onToggle={() => setMonthlyCostExpanded(!monthlyCostExpanded)}
      >
        <div className="bg-white rounded-lg p-3 space-y-3">
          <h5 className="text-sm font-medium text-text-muted">Utilities</h5>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyField
              label="County"
              value={data.monthlyCostToOwn.utilities.county}
              onChange={(value) =>
                updateUtilities(data, onChange, "county", value)
              }
              size="sm"
              data-testid="renovate-utility-county"
            />
            <CurrencyField
              label="Electricity"
              value={data.monthlyCostToOwn.utilities.electricity}
              onChange={(value) =>
                updateUtilities(data, onChange, "electricity", value)
              }
              size="sm"
              data-testid="renovate-utility-electricity"
            />
          </div>
        </div>

        <div className="mt-4">
          <CheckboxField
            id="deferInterestPayments"
            label="Defer Interest Payments"
            checked={data.monthlyCostToOwn.deferInterestPayments}
            onChange={(checked) =>
              updateMonthlyCost(
                data,
                onChange,
                "deferInterestPayments",
                checked,
              )
            }
            tooltip="When checked, mortgage interest payments during renovation are not counted as a monthly cost. Useful if your lender allows interest to accrue and be paid at closing."
            data-testid="renovate-defer-interest"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Renovation Summary"
        expanded={renovationSummaryExpanded}
        onToggle={() =>
          setRenovationSummaryExpanded(!renovationSummaryExpanded)
        }
      >
        <div className="space-y-2">
          {(() => {
            const totalCost = calculateTotalCost(data.items);
            const totalRenovationCost = calculateTotalRenovationCost(
              data.items,
              data.monthlyCostToOwn.utilities,
              data.timeToRenovate,
              monthlyPayment,
              loanOverlapMonths,
            );
            const totalDays = calculateTotalDays(data.timeToRenovate);

            return (
              <>
                <AnalysisItem
                  label="Renovation Items Cost"
                  value={totalCost > 0 ? `$${totalCost.toLocaleString()}` : "-"}
                />
                <AnalysisItem
                  label="Utilities & Mortgage"
                  value={
                    totalRenovationCost > totalCost
                      ? `$${(totalRenovationCost - totalCost).toLocaleString()}`
                      : "-"
                  }
                />
                <AnalysisItem
                  label="Total Renovation Cost"
                  value={
                    totalRenovationCost > 0
                      ? `$${totalRenovationCost.toLocaleString()}`
                      : "-"
                  }
                  highlight
                />
                <AnalysisItem
                  label="Estimated Timeline"
                  value={
                    totalDays > 0 ? `${Math.round(totalDays / 30)} months` : "-"
                  }
                />
              </>
            );
          })()}
        </div>
      </CollapsibleSection>
    </div>
  );
}
