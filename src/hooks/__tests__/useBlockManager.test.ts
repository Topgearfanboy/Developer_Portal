import { renderHook, act } from "@testing-library/react";
import { useBlockManager } from "../useBlockManager";
import { Block } from "@/types";
import {
  createBuyBlock,
  createProjectSettings,
  createRenovateBlock,
  createRentBlock,
  createSellBlock,
} from "@/test/factories";

const mockProjectSettings = createProjectSettings();
describe("useBlockManager", () => {
  describe("block management", () => {
    it("should initialize with empty blocks array", () => {
      const { result } = renderHook(() => useBlockManager());
      expect(result.current.blocks).toEqual([]);
      expect(result.current.hasBuyBlock).toBe(false);
      expect(result.current.hasSellBlock).toBe(false);
    });
    it("should initialize with provided blocks", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      expect(result.current.blocks).toHaveLength(1);
      expect(result.current.hasBuyBlock).toBe(true);
    });
  });
  describe("addBlock", () => {
    it("should add a buy block to the beginning", () => {
      const { result } = renderHook(() => useBlockManager());
      act(() => {
        result.current.addBlock("buy");
      });
      expect(result.current.blocks).toHaveLength(1);
      expect(result.current.blocks[0].type).toBe("buy");
      expect(result.current.hasBuyBlock).toBe(true);
    });
    it("should not add a second buy block", () => {
      const { result } = renderHook(() => useBlockManager());
      act(() => {
        result.current.addBlock("buy");
      });
      act(() => {
        result.current.addBlock("buy");
      });
      expect(result.current.blocks).toHaveLength(1);
    });
    it("should add a rent block after buy block", () => {
      const { result } = renderHook(() => useBlockManager());
      act(() => {
        result.current.addBlock("buy");
      });
      act(() => {
        result.current.addBlock("rent");
      });
      expect(result.current.blocks).toHaveLength(2);
      expect(result.current.blocks[0].type).toBe("buy");
      expect(result.current.blocks[1].type).toBe("rent");
    });
    it("should add a sell block", () => {
      const { result } = renderHook(() => useBlockManager());
      act(() => {
        result.current.addBlock("buy");
      });
      act(() => {
        result.current.addBlock("sell");
      });
      expect(result.current.blocks).toHaveLength(2);
      expect(result.current.hasSellBlock).toBe(true);
      expect(result.current.sellBlockIndex).toBe(1);
    });
    it("should not add a second sell block", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createSellBlock({
          id: "sell-1",
          sellPrice: "150000",
          timeToSellMonths: "3",
          closingCosts: "6",
          closingCostsType: "%",
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.addBlock("sell");
      });
      expect(result.current.blocks).toHaveLength(2);
    });
    it("should insert blocks before sell block", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createSellBlock({
          id: "sell-1",
          sellPrice: "150000",
          timeToSellMonths: "3",
          closingCosts: "6",
          closingCostsType: "%",
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.addBlock("rent");
      });
      expect(result.current.blocks).toHaveLength(3);
      expect(result.current.blocks[0].type).toBe("buy");
      expect(result.current.blocks[1].type).toBe("rent");
      expect(result.current.blocks[2].type).toBe("sell");
    });
    it("should calculate refinance estimated value with project settings", () => {
      // Freeze the date so the appreciation calculation is deterministic.
      // 2020-01-01 -> 2024-12-30 is exactly 5 * 365 days in the hook's
      // 365-day-year approximation, so the expected value is a clean number.
      jest.useFakeTimers({ now: new Date("2024-12-30").getTime() });

      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "200000",
          interestRate: "6",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
      ];
      const { result } = renderHook(() =>
        useBlockManager(initialBlocks, mockProjectSettings),
      );
      act(() => {
        result.current.addBlock("refinance");
      });
      const refinanceBlock = result.current.blocks.find(
        (b) => b.type === "refinance",
      );
      expect(refinanceBlock).toBeDefined();
      const refinanceData = refinanceBlock?.data as {
        estimatedValue?: string;
      };
      expect(refinanceData?.estimatedValue).toBeTruthy();
      expect(refinanceData?.estimatedValue).toMatch(/^\$[\d,]+$/);

      const numericValue = parseFloat(
        refinanceData?.estimatedValue?.replace(/[^0-9.]/g, "") || "0",
      );
      // 5 years of 5% appreciation on $200,000: $200,000 * 1.05^5 = $255,256
      expect(numericValue).toBeCloseTo(255256, 0);

      jest.useRealTimers();
    });
  });
  describe("removeBlock", () => {
    it("should remove a block by id", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.removeBlock("rent-1");
      });
      expect(result.current.blocks).toHaveLength(1);
      expect(result.current.blocks[0].type).toBe("buy");
    });
    it("should handle removing non-existent block gracefully", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.removeBlock("non-existent-id");
      });
      expect(result.current.blocks).toHaveLength(1);
    });
  });
  describe("moveBlock", () => {
    it("should move a block up", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
        createRenovateBlock({
          id: "renovate-1",
          items: [],
          timeToRenovate: { days: "", months: "3", years: "" },
          monthlyCostToOwn: {
            utilities: { county: "", electricity: "" },
            deferInterestPayments: false,
          },
          arv: "",
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      // Order: buy, rent, renovate
      expect(result.current.blocks[1].type).toBe("rent");
      expect(result.current.blocks[2].type).toBe("renovate");
      act(() => {
        result.current.moveBlock(2, "up");
      });
      // Order: buy, renovate, rent
      expect(result.current.blocks[1].type).toBe("renovate");
      expect(result.current.blocks[2].type).toBe("rent");
    });
    it("should move a block down", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
        createRenovateBlock({
          id: "renovate-1",
          items: [],
          timeToRenovate: { days: "", months: "3", years: "" },
          monthlyCostToOwn: {
            utilities: { county: "", electricity: "" },
            deferInterestPayments: false,
          },
          arv: "",
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      // Order: buy, rent, renovate
      act(() => {
        result.current.moveBlock(1, "down");
      });
      // Order: buy, renovate, rent
      expect(result.current.blocks[1].type).toBe("renovate");
      expect(result.current.blocks[2].type).toBe("rent");
    });
    it("should not move buy block", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.moveBlock(0, "down");
      });
      expect(result.current.blocks[0].type).toBe("buy");
      expect(result.current.blocks[1].type).toBe("rent");
    });
    it("should not move sell block", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
        createSellBlock({
          id: "sell-1",
          sellPrice: "150000",
          timeToSellMonths: "3",
          closingCosts: "6",
          closingCostsType: "%",
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.moveBlock(2, "up");
      });
      expect(result.current.blocks[2].type).toBe("sell");
    });
    it("should not move block above buy block", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.moveBlock(1, "up");
      });
      // rent should stay at index 1 because buy is at index 0
      expect(result.current.blocks[0].type).toBe("buy");
      expect(result.current.blocks[1].type).toBe("rent");
    });
    it("should not move block below sell block", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRenovateBlock({
          id: "renovate-1",
          items: [],
          timeToRenovate: { days: "", months: "3", years: "" },
          monthlyCostToOwn: {
            utilities: { county: "", electricity: "" },
            deferInterestPayments: false,
          },
          arv: "",
        }),
        createSellBlock({
          id: "sell-1",
          sellPrice: "150000",
          timeToSellMonths: "3",
          closingCosts: "6",
          closingCostsType: "%",
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.moveBlock(1, "down");
      });
      // renovate should stay at index 1 because sell is at index 2
      expect(result.current.blocks[1].type).toBe("renovate");
    });
    it("should not move up when at index 0", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.moveBlock(0, "up");
      });
      expect(result.current.blocks[0].type).toBe("buy");
      expect(result.current.blocks[1].type).toBe("rent");
    });
    it("should not move down when at last index", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      act(() => {
        result.current.moveBlock(1, "down");
      });
      expect(result.current.blocks).toHaveLength(2);
      expect(result.current.blocks[1].type).toBe("rent");
    });
  });
  describe("updateBlockData", () => {
    it("should update block data", () => {
      const { result } = renderHook(() => useBlockManager());
      act(() => {
        result.current.addBlock("buy");
      });
      const buyBlock = result.current.blocks[0];
      act(() => {
        result.current.updateBlockData(buyBlock.id, {
          ...buyBlock.data,
          cost: "300000",
        });
      });
      expect(
        (
          result.current.blocks[0].data as {
            cost?: string;
          }
        ).cost,
      ).toBe("300000");
    });
    it("should not affect other blocks", () => {
      const initialBlocks: Block[] = [
        createBuyBlock({
          id: "buy-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
        createRentBlock({
          id: "rent-1",
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
        }),
      ];
      const { result } = renderHook(() => useBlockManager(initialBlocks));
      const buyBlock = result.current.blocks[0];
      act(() => {
        result.current.updateBlockData(buyBlock.id, {
          ...buyBlock.data,
          cost: "300000",
        });
      });
      expect(
        (
          result.current.blocks[0].data as {
            cost?: string;
          }
        ).cost,
      ).toBe("300000");
      // Verify rent block is unchanged
      expect(result.current.blocks[1].type).toBe("rent");
      expect(result.current.blocks[1].data).toEqual(initialBlocks[1].data);
    });
  });
  describe("setBlocks", () => {
    it("should set blocks directly", () => {
      const { result } = renderHook(() => useBlockManager());
      const newBlocks: Block[] = [
        createBuyBlock({
          id: "test-1",
          cost: "100000",
          interestRate: "5",
          downpayment: "20",
          downpaymentType: "%",
          closingCosts: "3",
          closingCostsType: "%",
          propertyTaxes: "1",
          propertyTaxesType: "%",
          annualHoa: "0",
          homeownersInsurance: "600",
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
        }),
      ];
      act(() => {
        result.current.setBlocks(newBlocks);
      });
      expect(result.current.blocks).toEqual(newBlocks);
    });
    it("should accept a function updater", () => {
      const { result } = renderHook(() => useBlockManager());
      act(() => {
        result.current.addBlock("buy");
      });
      act(() => {
        result.current.setBlocks((prev) => [
          ...prev,
          createRentBlock({
            id: "test-rent",
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
          }),
        ]);
      });
      expect(result.current.blocks).toHaveLength(2);
    });
  });
});
