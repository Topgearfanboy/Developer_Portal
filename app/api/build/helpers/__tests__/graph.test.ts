import { calculateGraphData } from "../graph";
import { Block } from "@/types";

describe("calculateGraphData", () => {
  it("should return static data when no buy block exists", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "rent",
        data: {
          timeRentedMonths: "12",
          timeRentedYears: "0",
          monthlyRent: "2000",
          vacancy: "0",
          vacancyType: "$",
          management: "0",
          managementType: "$",
          maintenance: "0",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "%",
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    );
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2024-01");
    expect(result[0].investedCapital).toBe(0);
    expect(result[0].cashOnHand).toBe(0);
    expect(result[0].equity).toBe(0);
    expect(result[0].remainingLoanBalance).toBe(0);
  });

  it("should generate graph data for 30 years by default", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "5",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "3600",
          propertyTaxesType: "$",
          homeownersInsurance: "1200",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].date).toBe("2024-01");
    expect(result[0].investedCapital).toBeGreaterThanOrEqual(20000); // downpayment + any initial expenses
  });

  it("should limit data points based on years parameter", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "5",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "3600",
          propertyTaxesType: "$",
          homeownersInsurance: "1200",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      5,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    ); // 5 years
    expect(result.length).toBeLessThanOrEqual(60); // 5 years * 12 months
  });

  it("should generate correct date strings", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "$100000",
          downpayment: "$20000",
          downpaymentType: "$",
          interestRate: "5",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "3600",
          propertyTaxesType: "$",
          homeownersInsurance: "1200",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      1,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    ); // 1 year
    expect(result[0].date).toBe("2024-01");
    expect(result[11].date).toBe("2024-12");
  });

  it("should apply net sale proceeds and continue the graph flat to the selected horizon", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "100000",
          downpayment: "100000",
          downpaymentType: "$",
          interestRate: "0",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "0",
          propertyTaxesType: "$",
          homeownersInsurance: "0",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
      {
        id: "2",
        type: "sell",
        data: {
          sellPrice: "120000",
          timeToSellMonths: "0",
          closingCosts: "0",
          closingCostsType: "$",
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    );
    expect(result).toHaveLength(360); // 30 years * 12 months
    expect(result[0].cashOnHand).toBe(120000);
    expect(result[0].equity).toBe(0);
    expect(result[0].remainingLoanBalance).toBe(0);
    expect(result[0].monthlyNet).toBe(120000);
    // Post-sale months continue flat
    expect(result[359].cashOnHand).toBe(120000);
    expect(result[359].equity).toBe(0);
    expect(result[359].remainingLoanBalance).toBe(0);
    expect(result[359].monthlyNet).toBe(0);
  });

  it("should include carrying costs during timeToSellMonths and continue flat after sale", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "100000",
          downpayment: "100000",
          downpaymentType: "$",
          interestRate: "0",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "1200",
          propertyTaxesType: "$",
          homeownersInsurance: "600",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
      {
        id: "2",
        type: "sell",
        data: {
          sellPrice: "120000",
          timeToSellMonths: "3",
          closingCosts: "0",
          closingCostsType: "$",
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    );
    // 3 carrying months (0, 1, 2), sale at end of month 2, graph continues to 30 years
    expect(result).toHaveLength(360);
    // Carrying costs are absorbed into investedCapital; cash on hand receives gross proceeds
    expect(result[2].cashOnHand).toBe(120000);
    expect(result[2].investedCapital).toBe(100000 + 150 + 150 + 150);
    expect(result[2].equity).toBe(0);
    expect(result[2].remainingLoanBalance).toBe(0);
    // Post-sale months continue flat
    expect(result[359].cashOnHand).toBe(120000);
    expect(result[359].equity).toBe(0);
    expect(result[359].remainingLoanBalance).toBe(0);
    expect(result[359].monthlyNet).toBe(0);
  });

  it("should subtract remaining loan balance from sale proceeds and continue flat", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "buy",
        data: {
          cost: "100000",
          downpayment: "20000",
          downpaymentType: "$",
          interestRate: "0",
          loanTerm: "30",
          customLoanTerm: "",
          interestOnlyOption: false,
          propertyTaxes: "0",
          propertyTaxesType: "$",
          homeownersInsurance: "0",
          homeownersInsuranceType: "$",
          annualHoa: "0",
          closingCosts: "0",
          closingCostsType: "$",
          loanTermYears: 30,
          loanAnalysis: {
            incomeNeeded: "0",
            maxLoanBasedOnArv: "0",
            initialCash: "0",
            savedForRenovation: "0",
            minimumCashForProject: "0",
          },
        },
      },
      {
        id: "2",
        type: "sell",
        data: {
          sellPrice: "120000",
          timeToSellMonths: "0",
          closingCosts: "0",
          closingCostsType: "$",
        },
      },
    ];
    const result = calculateGraphData(
      blocks,
      30,
      "profit",
      0,
      0,
      "2024-01-01T12:00:00",
    );
    // 0% loan, first payment reduces balance and loanBalance helper rounds to nearest dollar
    expect(result).toHaveLength(360);
    expect(result[0].cashOnHand).toBe(120000 - 79778);
    expect(result[0].remainingLoanBalance).toBe(0);
    // Post-sale months continue flat
    expect(result[359].cashOnHand).toBe(120000 - 79778);
    expect(result[359].equity).toBe(0);
    expect(result[359].remainingLoanBalance).toBe(0);
    expect(result[359].monthlyNet).toBe(0);
  });
});
