import type { BuyBlockData } from "../../types";
import { createTypeChangeHandler } from "../../utils/valueTypeConverter";
import { calculateMonthlyPaymentBreakdown } from "../../utils/mortgageCalculator";

const getCostBase = (data: BuyBlockData) =>
  parseFloat(data.cost.replace(/[^0-9.]/g, "")) || 0;

export function parseCurrencyValue(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

export interface PurchaseSummary {
  costNum: number;
  downpaymentNum: number;
  closingNum: number;
  loanAmount: number;
  totalCashNeeded: number;
  principalAndInterest: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  hoa: number;
  totalMonthlyPayment: number;
}

export function calculatePurchaseSummary(data: BuyBlockData): PurchaseSummary {
  const costNum = parseCurrencyValue(data.cost);

  const downpaymentRaw = parseCurrencyValue(data.downpayment);
  const downpaymentNum =
    data.downpaymentType === "%"
      ? (downpaymentRaw / 100) * costNum
      : downpaymentRaw;

  const closingRaw = parseCurrencyValue(data.closingCosts);
  const closingNum =
    data.closingCostsType === "%" ? (closingRaw / 100) * costNum : closingRaw;

  const loanAmount = costNum - downpaymentNum;
  const totalCashNeeded = downpaymentNum + closingNum;

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
      baseValue: costNum,
      propertyTaxesValue: parseFloat(data.propertyTaxes) || 0,
      propertyTaxesType: data.propertyTaxesType,
      homeownersInsuranceValue: parseFloat(data.homeownersInsurance) || 0,
      homeownersInsuranceType: data.homeownersInsuranceType,
      annualHoa: parseCurrencyValue(data.annualHoa),
    },
  );

  return {
    costNum,
    downpaymentNum,
    closingNum,
    loanAmount,
    totalCashNeeded,
    principalAndInterest: breakdown.principalAndInterest,
    propertyTaxes: breakdown.propertyTaxes,
    homeownersInsurance: breakdown.homeownersInsurance,
    hoa: breakdown.hoa,
    totalMonthlyPayment: breakdown.total,
  };
}

export const handleDownpaymentTypeChange = (
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "downpaymentType",
    valueField: "downpayment",
    getBaseAmount: getCostBase,
  })(newType);

export const handleClosingCostsTypeChange = (
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "closingCostsType",
    valueField: "closingCosts",
    getBaseAmount: getCostBase,
  })(newType);

export const handlePropertyTaxesTypeChange = (
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "propertyTaxesType",
    valueField: "propertyTaxes",
    getBaseAmount: getCostBase,
  })(newType);

export const handleHomeownersInsuranceTypeChange = (
  data: BuyBlockData,
  onChange: (data: BuyBlockData) => void,
  newType: "$" | "%",
) =>
  createTypeChangeHandler(data, onChange, {
    typeField: "homeownersInsuranceType",
    valueField: "homeownersInsurance",
    getBaseAmount: getCostBase,
  })(newType);
