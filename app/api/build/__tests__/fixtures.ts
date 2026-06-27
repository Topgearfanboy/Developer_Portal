import {
  Block,
  BuyBlockData,
  RentBlockData,
  RefinanceBlockData,
  RenovateBlockData,
  SellBlockData,
} from "@/types";

// Default loan analysis values
const defaultLoanAnalysis = {
  incomeNeeded: "",
  maxLoanBasedOnArv: "",
  initialCash: "",
  savedForRenovation: "",
  minimumCashForProject: "",
};

/**
 * Creates a standard buy block with sensible defaults
 */
export function createBuyBlock(overrides: Partial<BuyBlockData> = {}): Block {
  return {
    id: `buy-${Date.now()}`,
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
      loanAnalysis: defaultLoanAnalysis,
      ...overrides,
    },
  };
}

/**
 * Creates a standard rent block
 */
export function createRentBlock(overrides: Partial<RentBlockData> = {}): Block {
  return {
    id: `rent-${Date.now()}`,
    type: "rent",
    data: {
      monthlyRent: "2000",
      timeRentedMonths: "12",
      timeRentedYears: "0",
      vacancy: "0",
      vacancyType: "$",
      management: "0",
      managementType: "$",
      maintenance: "0",
      maintenanceType: "$",
      annualRentIncrease: "0",
      annualRentIncreaseType: "%",
      ...overrides,
    },
  };
}

/**
 * Creates a renovate block
 */
export function createRenovateBlock(
  overrides: Partial<RenovateBlockData> = {},
): Block {
  return {
    id: `renovate-${Date.now()}`,
    type: "renovate",
    data: {
      items: [],
      timeToRenovate: { days: "", months: "3", years: "" },
      monthlyCostToOwn: {
        utilities: { county: "", electricity: "" },
        deferInterestPayments: false,
      },
      arv: "",
      ...overrides,
    },
  };
}

/**
 * Creates a refinance block
 */
export function createRefinanceBlock(
  overrides: Partial<RefinanceBlockData> = {},
): Block {
  return {
    id: `refinance-${Date.now()}`,
    type: "refinance",
    data: {
      cashOut: false,
      estimatedValue: "300000",
      remainingEquityAmount: "",
      remainingEquityPercent: "",
      cost: "",
      costType: "$",
      interestRate: "6",
      closingCosts: "",
      closingCostsType: "%",
      propertyTaxes: "",
      propertyTaxesType: "%",
      homeownersInsurance: "",
      homeownersInsuranceType: "$",
      loanTerm: "30",
      customLoanTerm: "",
      loanTermYears: 30,
      annualHoa: "0",
      interestOnlyOption: false,
      ...overrides,
    },
  };
}

/**
 * Creates a sell block
 */
export function createSellBlock(overrides: Partial<SellBlockData> = {}): Block {
  return {
    id: `sell-${Date.now()}`,
    type: "sell",
    data: {
      sellPrice: "350000",
      timeToSellMonths: "3",
      closingCosts: "6",
      closingCostsType: "%",
      ...overrides,
    },
  };
}

/**
 * Common block combinations for integration tests
 */
export const TestScenarios = {
  // Simple buy + rent
  buyAndRent: (
    buyOverrides?: Partial<BuyBlockData>,
    rentOverrides?: Partial<RentBlockData>,
  ): Block[] => [createBuyBlock(buyOverrides), createRentBlock(rentOverrides)],

  // Buy + renovate + rent
  fullProject: (
    buyOverrides?: Partial<BuyBlockData>,
    renovateOverrides?: Partial<RenovateBlockData>,
    rentOverrides?: Partial<RentBlockData>,
  ): Block[] => [
    createBuyBlock(buyOverrides),
    createRenovateBlock(renovateOverrides),
    createRentBlock(rentOverrides),
  ],

  // Buy + rent + refinance
  withRefinance: (
    buyOverrides?: Partial<BuyBlockData>,
    rentOverrides?: Partial<RentBlockData>,
    refinanceOverrides?: Partial<RefinanceBlockData>,
  ): Block[] => [
    createBuyBlock(buyOverrides),
    createRentBlock(rentOverrides),
    createRefinanceBlock(refinanceOverrides),
  ],

  // Complex scenario: Buy + renovate + rent + refinance
  complex: (
    buyOverrides?: Partial<BuyBlockData>,
    renovateOverrides?: Partial<RenovateBlockData>,
    rentOverrides?: Partial<RentBlockData>,
    refinanceOverrides?: Partial<RefinanceBlockData>,
  ): Block[] => [
    createBuyBlock(buyOverrides),
    createRenovateBlock(renovateOverrides),
    createRentBlock(rentOverrides),
    createRefinanceBlock(refinanceOverrides),
  ],

  // Buy + rent + sell
  withSell: (
    buyOverrides?: Partial<BuyBlockData>,
    rentOverrides?: Partial<RentBlockData>,
    sellOverrides?: Partial<SellBlockData>,
  ): Block[] => [
    createBuyBlock(buyOverrides),
    createRentBlock(rentOverrides),
    createSellBlock(sellOverrides),
  ],
};
