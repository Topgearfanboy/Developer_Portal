import type { RefinanceBlockData } from "../../types";
import { createTypeChangeHandler } from "../../utils/valueTypeConverter";
import { calculateMonthlyPaymentBreakdown } from "../../utils/mortgageCalculator";

export const updateField = <K extends keyof RefinanceBlockData>(
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  field: K,
  value: RefinanceBlockData[K],
) => {
  onChange({ ...data, [field]: value });
};

const getEstimatedValueBase = (data: RefinanceBlockData) =>
  parseFloat(data.estimatedValue.replace(/[^0-9.]/g, "")) || 0;

const getCostBase = (data: RefinanceBlockData) =>
  parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;

export const handleCostTypeChange = (
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "costType",
    valueField: "cost",
    getBaseAmount: getEstimatedValueBase,
  })(newType);

export const handleClosingCostsTypeChange = (
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "closingCostsType",
    valueField: "closingCosts",
    getBaseAmount: getCostBase,
  })(newType);

export const handlePropertyTaxesTypeChange = (
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "propertyTaxesType",
    valueField: "propertyTaxes",
    getBaseAmount: getCostBase,
  })(newType);

export const handleHomeownersInsuranceTypeChange = (
  data: RefinanceBlockData,
  onChange: (data: RefinanceBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "homeownersInsuranceType",
    valueField: "homeownersInsurance",
    getBaseAmount: getCostBase,
  })(newType);

export interface RefinancePaymentSummary {
  loanAmount: number;
  principalAndInterest: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  totalMonthlyPayment: number;
}

export function calculateRefinancePaymentSummary(
  data: RefinanceBlockData,
): RefinancePaymentSummary {
  const estimatedValueNum = parseCurrencyValue(data.estimatedValue);
  const costNum = parseCurrencyValue(data.cost);
  const loanAmount =
    data.costType === "%" ? (costNum / 100) * estimatedValueNum : costNum;

  const termYears =
    data.loanTerm === "custom"
      ? parseInt(data.customLoanTerm) || 30
      : parseInt(data.loanTerm) || 30;

  const breakdown = calculateMonthlyPaymentBreakdown(
    {
      loanAmount,
      annualInterestRate: parseFloat(data.interestRate) || 0,
      loanTermYears: termYears,
      interestOnly: data.interestOnlyOption,
    },
    {
      baseValue: estimatedValueNum,
      propertyTaxesValue: parseFloat(data.propertyTaxes) || 0,
      propertyTaxesType: data.propertyTaxesType,
      homeownersInsuranceValue: parseFloat(data.homeownersInsurance) || 0,
      homeownersInsuranceType: data.homeownersInsuranceType,
      annualHoa: 0,
    },
  );

  return {
    loanAmount,
    principalAndInterest: breakdown.principalAndInterest,
    propertyTaxes: breakdown.propertyTaxes,
    homeownersInsurance: breakdown.homeownersInsurance,
    totalMonthlyPayment: breakdown.total,
  };
}

// Calculation helpers for analysis
export const parseCurrencyValue = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
};

export const calculateLoanAmount = (
  estimatedValue: string,
  remainingEquityAmount: string,
): number => {
  const valueNum = parseCurrencyValue(estimatedValue);
  const equityAmountNum = parseCurrencyValue(remainingEquityAmount);
  return valueNum - equityAmountNum;
};

export const formatCurrencyDisplay = (value: number): string => {
  return value > 0 ? `$${value.toLocaleString()}` : "-";
};

export const formatPercentageDisplay = (value: string): string => {
  const percentNum = parseFloat(value) || 0;
  return percentNum > 0 ? `${percentNum.toFixed(2)}%` : "-";
};
