import { calculateGraphData } from "../helpers/graph";
import type { Block } from "@/types";

describe("Refinance 0.01 Rate Test", () => {
  it("should have monthlyNet of -471.23 on 2035-01 with 0.01% refinance rate", () => {
    const blocks: Block[] = [
      {
        id: "buy-1780628139452-ix8ez6mf6",
        type: "buy",
        data: {
          cost: "225000",
          interestRate: "6",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "740",
          homeownersInsuranceType: "$",
          loanTerm: "30",
          customLoanTerm: "",
          loanTermYears: 30,
          interestOnlyOption: false,
          loanAnalysis: {
            incomeNeeded: "",
            maxLoanBasedOnArv: "",
            initialCash: "",
            savedForRenovation: "",
            minimumCashForProject: "",
          },
        },
      },
      {
        id: "renovate-1780628142276-y5k7ci37r",
        type: "renovate",
        data: {
          items: [
            {
              item: "",
              cost: "13000",
            },
          ],
          timeToRenovate: {
            days: "",
            months: "3",
            years: "",
          },
          monthlyCostToOwn: {
            utilities: {
              county: "",
              electricity: "",
            },
            deferInterestPayments: false,
          },
          arv: "280000",
        },
      },
      {
        id: "rent-1780628144032-4ytcwrm3x",
        type: "rent",
        data: {
          monthlyRent: "1875",
          timeRentedMonths: "0",
          timeRentedYears: "1",
          vacancy: "0",
          vacancyType: "%",
          management: "0",
          managementType: "%",
          maintenance: "100",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "$",
        },
      },
      {
        id: "rent-1780628146108-fxcr8k6m6",
        type: "rent",
        data: {
          monthlyRent: "2100",
          timeRentedMonths: "0",
          timeRentedYears: "3",
          vacancy: "0",
          vacancyType: "%",
          management: "0",
          managementType: "%",
          maintenance: "100",
          maintenanceType: "$",
          annualRentIncrease: "0",
          annualRentIncreaseType: "%",
          durationMonths: 36,
        },
      },
      {
        id: "refinance-1781202204585-s1ehltj35",
        type: "refinance",
        data: {
          cashOut: false,
          estimatedValue: "300000",
          remainingEquityAmount: "",
          remainingEquityPercent: "",
          cost: "169389.00",
          costType: "$",
          interestRate: "0.01",
          closingCosts: "",
          closingCostsType: "%",
          propertyTaxes: "0",
          propertyTaxesType: "$",
          homeownersInsurance: "",
          homeownersInsuranceType: "$",
          loanTerm: "30",
          customLoanTerm: "",
          loanTermYears: 30,
          annualHoa: "0",
          interestOnlyOption: false,
        },
      },
    ];

    const graphData = calculateGraphData(blocks);

    // Find the 2035-01 month
    const targetMonth = graphData.find((month) => month.date === "2035-01");

    expect(targetMonth).toBeDefined();

    // The refinance block sets taxes and insurance to 0, so monthlyNet should be just the mortgage payment
    expect(targetMonth!.monthlyNet).toBeCloseTo(-471.23, 2);
  });
});
