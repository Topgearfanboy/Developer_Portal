import {
  calculatePrincipalAndInterest,
  calculateMonthlyExpenses,
  calculateMonthlyPaymentBreakdown,
} from "../mortgageCalculator";

describe("calculatePrincipalAndInterest", () => {
  it("returns 0 when loan amount is 0", () => {
    expect(
      calculatePrincipalAndInterest({
        loanAmount: 0,
        annualInterestRate: 6,
        loanTermYears: 30,
        interestOnly: false,
      }),
    ).toBe(0);
  });

  it("calculates interest-only payment", () => {
    expect(
      calculatePrincipalAndInterest({
        loanAmount: 200000,
        annualInterestRate: 6,
        loanTermYears: 30,
        interestOnly: true,
      }),
    ).toBe(1000);
  });

  it("calculates fixed-rate principal and interest payment", () => {
    const payment = calculatePrincipalAndInterest({
      loanAmount: 200000,
      annualInterestRate: 6,
      loanTermYears: 30,
      interestOnly: false,
    });
    expect(payment).toBeCloseTo(1199.1, 1);
  });

  it("handles zero interest rate", () => {
    expect(
      calculatePrincipalAndInterest({
        loanAmount: 200000,
        annualInterestRate: 0,
        loanTermYears: 30,
        interestOnly: false,
      }),
    ).toBeCloseTo(555.56, 2);
  });
});

describe("calculateMonthlyExpenses", () => {
  it("calculates dollar-based expenses", () => {
    const result = calculateMonthlyExpenses({
      baseValue: 250000,
      propertyTaxesValue: 2400,
      propertyTaxesType: "$",
      homeownersInsuranceValue: 1200,
      homeownersInsuranceType: "$",
      annualHoa: 600,
    });

    expect(result.propertyTaxes).toBe(200);
    expect(result.homeownersInsurance).toBe(100);
    expect(result.hoa).toBe(50);
  });

  it("calculates percentage-based expenses", () => {
    const result = calculateMonthlyExpenses({
      baseValue: 250000,
      propertyTaxesValue: 1,
      propertyTaxesType: "%",
      homeownersInsuranceValue: 0.5,
      homeownersInsuranceType: "%",
      annualHoa: 0,
    });

    expect(result.propertyTaxes).toBeCloseTo(208.33, 2);
    expect(result.homeownersInsurance).toBeCloseTo(104.17, 2);
    expect(result.hoa).toBe(0);
  });
});

describe("calculateMonthlyPaymentBreakdown", () => {
  it("returns the full monthly payment breakdown", () => {
    const result = calculateMonthlyPaymentBreakdown(
      {
        loanAmount: 200000,
        annualInterestRate: 6,
        loanTermYears: 30,
        interestOnly: false,
      },
      {
        baseValue: 250000,
        propertyTaxesValue: 1,
        propertyTaxesType: "%",
        homeownersInsuranceValue: 1200,
        homeownersInsuranceType: "$",
        annualHoa: 600,
      },
    );

    expect(result.principalAndInterest).toBeCloseTo(1199.1, 1);
    expect(result.propertyTaxes).toBeCloseTo(208.33, 2);
    expect(result.homeownersInsurance).toBe(100);
    expect(result.hoa).toBe(50);
    expect(result.total).toBeCloseTo(1557.43, 1);
  });
});
