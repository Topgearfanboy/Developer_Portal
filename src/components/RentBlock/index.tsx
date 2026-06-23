import type { RentBlockData } from "../../types";
import { CurrencyField } from "../uiComponents/fieldTypes/CurrencyField";
import { LabeledCurrencyOrPercentageField } from "../shared/LabeledCurrencyOrPercentageField";
import { TimePeriodSelector } from "../shared/TimePeriodSelector";
import {
  handleVacancyTypeChange,
  handleManagementTypeChange,
  handleMaintenanceTypeChange,
  handleAnnualRentIncreaseTypeChange,
} from "./helpers";

interface RentBlockProps {
  data: RentBlockData;
  onChange: (data: RentBlockData) => void;
}

export function RentBlock({ data, onChange }: RentBlockProps) {
  const updateField = <K extends keyof RentBlockData>(
    field: K,
    value: RentBlockData[K],
  ) => {
    const updatedData = { ...data, [field]: value };

    // Calculate durationMonths when time fields change
    if (field === "timeRentedMonths" || field === "timeRentedYears") {
      const months = parseInt(updatedData.timeRentedMonths) || 0;
      const years = parseInt(updatedData.timeRentedYears) || 0;
      updatedData.durationMonths = months + years * 12;
    }

    onChange(updatedData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          label="Monthly Rent"
          value={data.monthlyRent}
          onChange={(value) => updateField("monthlyRent", value)}
          data-testid="rent-monthly-rent"
        />

        <TimePeriodSelector
          label="Time Rented"
          values={{
            months: data.timeRentedMonths,
            years: data.timeRentedYears,
          }}
          units={[
            { key: "months", label: "Months", max: 12 },
            { key: "years", label: "Years", max: 31 },
          ]}
          onChange={(key, value) =>
            updateField(key as "timeRentedMonths" | "timeRentedYears", value)
          }
        />

        <LabeledCurrencyOrPercentageField
          label="Vacancy"
          tooltip="The percentage of time or dollar amount lost to unoccupied periods. A typical vacancy rate is 5–10% of monthly rent."
          value={data.vacancy}
          type={data.vacancyType}
          onChange={(value) => updateField("vacancy", value)}
          onTypeChange={(type) => handleVacancyTypeChange(data, onChange, type)}
        />

        <LabeledCurrencyOrPercentageField
          label="Management"
          tooltip="Property management fee, typically 8–12% of monthly rent. Enter 0 if self-managing."
          value={data.management}
          type={data.managementType}
          onChange={(value) => updateField("management", value)}
          onTypeChange={(type) =>
            handleManagementTypeChange(data, onChange, type)
          }
        />

        <LabeledCurrencyOrPercentageField
          label="Maintenance"
          tooltip="Budget for ongoing repairs and upkeep. A common rule of thumb is 1% of the property value per year, or ~10% of monthly rent."
          value={data.maintenance}
          type={data.maintenanceType}
          onChange={(value) => updateField("maintenance", value)}
          onTypeChange={(type) =>
            handleMaintenanceTypeChange(data, onChange, type)
          }
        />

        <LabeledCurrencyOrPercentageField
          label="Annual Rent Increase"
          tooltip="The expected yearly increase in rent, applied each year of the rental period. Typically 2–5% to account for inflation and market growth."
          value={data.annualRentIncrease || "0"}
          type={data.annualRentIncreaseType || "%"}
          onChange={(value) => updateField("annualRentIncrease", value)}
          onTypeChange={(type) =>
            handleAnnualRentIncreaseTypeChange(data, onChange, type)
          }
        />
      </div>
    </div>
  );
}
