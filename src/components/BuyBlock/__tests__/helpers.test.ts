import type { BuyBlockData } from "../../../types";
import {
  handleDownpaymentTypeChange,
  handleClosingCostsTypeChange,
  handlePropertyTaxesTypeChange,
  handleHomeownersInsuranceTypeChange,
} from "../helpers";

const mockOnChange = jest.fn();

const createMockData = (
  overrides: Partial<BuyBlockData> = {},
): BuyBlockData => ({
  cost: "300000",
  interestRate: "6",
  downpayment: "20",
  downpaymentType: "%",
  closingCosts: "3",
  closingCostsType: "%",
  propertyTaxes: "1",
  propertyTaxesType: "%",
  annualHoa: "0",
  homeownersInsurance: "1200",
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
  ...overrides,
});

describe("BuyBlock Helpers", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("handleDownpaymentTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        cost: "300000",
        downpayment: "20",
        downpaymentType: "%",
      });
      handleDownpaymentTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        downpaymentType: "$",
        downpayment: "60000",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        cost: "300000",
        downpayment: "60000",
        downpaymentType: "$",
      });
      handleDownpaymentTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        downpaymentType: "%",
        downpayment: "20.00",
      });
    });

    it.concurrent("handles zero cost gracefully", () => {
      const data = createMockData({
        cost: "0",
        downpayment: "20",
        downpaymentType: "%",
      });
      handleDownpaymentTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        downpaymentType: "$",
        downpayment: "20",
      });
    });

    it.concurrent("preserves value when switching to same type", () => {
      const data = createMockData({ downpayment: "20", downpaymentType: "%" });
      handleDownpaymentTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        downpaymentType: "%",
        downpayment: "20",
      });
    });
  });

  describe("handleClosingCostsTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        cost: "300000",
        closingCosts: "3",
        closingCostsType: "%",
      });
      handleClosingCostsTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        closingCostsType: "$",
        closingCosts: "9000",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        cost: "300000",
        closingCosts: "9000",
        closingCostsType: "$",
      });
      handleClosingCostsTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        closingCostsType: "%",
        closingCosts: "3.00",
      });
    });

    it.concurrent("handles zero cost gracefully", () => {
      const data = createMockData({
        cost: "0",
        closingCosts: "3",
        closingCostsType: "%",
      });
      handleClosingCostsTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        closingCostsType: "$",
        closingCosts: "3",
      });
    });
  });

  describe("handlePropertyTaxesTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        cost: "300000",
        propertyTaxes: "1",
        propertyTaxesType: "%",
      });
      handlePropertyTaxesTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        propertyTaxesType: "$",
        propertyTaxes: "3000",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        cost: "300000",
        propertyTaxes: "3000",
        propertyTaxesType: "$",
      });
      handlePropertyTaxesTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        propertyTaxesType: "%",
        propertyTaxes: "1.00",
      });
    });

    it.concurrent("handles empty values gracefully", () => {
      const data = createMockData({
        propertyTaxes: "",
        propertyTaxesType: "%",
      });
      handlePropertyTaxesTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        propertyTaxesType: "$",
        propertyTaxes: "0",
      });
    });
  });

  describe("handleHomeownersInsuranceTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        cost: "300000",
        homeownersInsurance: "0.5",
        homeownersInsuranceType: "%",
      });
      handleHomeownersInsuranceTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        homeownersInsuranceType: "$",
        homeownersInsurance: "1500",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        cost: "300000",
        homeownersInsurance: "1500",
        homeownersInsuranceType: "$",
      });
      handleHomeownersInsuranceTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        homeownersInsuranceType: "%",
        homeownersInsurance: "0.50",
      });
    });

    it.concurrent("handles cost with commas", () => {
      const data = createMockData({
        cost: "$300,000",
        homeownersInsurance: "1200",
        homeownersInsuranceType: "$",
      });
      handleHomeownersInsuranceTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        homeownersInsuranceType: "%",
        homeownersInsurance: "0.40",
      });
    });
  });
});
