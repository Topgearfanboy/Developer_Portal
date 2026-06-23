export interface MonthlyPaymentInputs {
  loanAmount: number;
  annualInterestRate: number;
  loanTermYears: number;
  interestOnly: boolean;
}

export interface MonthlyPaymentBreakdown {
  principalAndInterest: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  hoa: number;
  total: number;
}

/**
 * Calculate the monthly principal and interest payment using the standard
 * amortization formula.
 */
export function calculatePrincipalAndInterest(
  inputs: MonthlyPaymentInputs,
): number {
  const { loanAmount, annualInterestRate, loanTermYears, interestOnly } =
    inputs;

  if (loanAmount <= 0) {
    return 0;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  if (interestOnly) {
    return loanAmount * monthlyRate;
  }

  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }

  return (
    (loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

export interface MonthlyExpenseInputs {
  baseValue: number;
  propertyTaxesValue: number;
  propertyTaxesType: "$" | "%";
  homeownersInsuranceValue: number;
  homeownersInsuranceType: "$" | "%";
  annualHoa: number;
}

/**
 * Calculate the monthly property tax, insurance, and HOA portions.
 */
export function calculateMonthlyExpenses(
  inputs: MonthlyExpenseInputs,
): Pick<MonthlyPaymentBreakdown, "propertyTaxes" | "homeownersInsurance" | "hoa"> {
  const {
    baseValue,
    propertyTaxesValue,
    propertyTaxesType,
    homeownersInsuranceValue,
    homeownersInsuranceType,
    annualHoa,
  } = inputs;

  const propertyTaxes =
    propertyTaxesType === "%"
      ? ((propertyTaxesValue / 100) * baseValue) / 12
      : propertyTaxesValue / 12;

  const homeownersInsurance =
    homeownersInsuranceType === "%"
      ? ((homeownersInsuranceValue / 100) * baseValue) / 12
      : homeownersInsuranceValue / 12;

  const hoa = annualHoa / 12;

  return { propertyTaxes, homeownersInsurance, hoa };
}

/**
 * Calculate the complete monthly payment breakdown including principal,
 * interest, taxes, insurance, and HOA.
 */
export function calculateMonthlyPaymentBreakdown(
  paymentInputs: MonthlyPaymentInputs,
  expenseInputs: MonthlyExpenseInputs,
): MonthlyPaymentBreakdown {
  const principalAndInterest = calculatePrincipalAndInterest(paymentInputs);
  const expenses = calculateMonthlyExpenses(expenseInputs);

  return {
    principalAndInterest,
    ...expenses,
    total: principalAndInterest + expenses.propertyTaxes + expenses.homeownersInsurance + expenses.hoa,
  };
}
