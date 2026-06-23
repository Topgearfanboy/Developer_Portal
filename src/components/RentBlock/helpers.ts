import type { RentBlockData } from "../../types";
import { createTypeChangeHandler } from "../../utils/valueTypeConverter";

const getMonthlyRentBase = (data: RentBlockData) =>
  parseFloat(data.monthlyRent.replace(/[^0-9.]/g, "")) || 0;

export const handleVacancyTypeChange = (
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "vacancyType",
    valueField: "vacancy",
    getBaseAmount: getMonthlyRentBase,
  })(newType);

export const handleManagementTypeChange = (
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "managementType",
    valueField: "management",
    getBaseAmount: getMonthlyRentBase,
  })(newType);

export const handleMaintenanceTypeChange = (
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "maintenanceType",
    valueField: "maintenance",
    getBaseAmount: getMonthlyRentBase,
  })(newType);

export const handleAnnualRentIncreaseTypeChange = (
  data: RentBlockData,
  onChange: (data: RentBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "annualRentIncreaseType",
    valueField: "annualRentIncrease",
    getBaseAmount: getMonthlyRentBase,
  })(newType);
