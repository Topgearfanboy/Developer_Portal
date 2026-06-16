import type { RentBlockData } from "../../../types";
import {
  handleVacancyTypeChange,
  handleManagementTypeChange,
  handleMaintenanceTypeChange,
  handleAnnualRentIncreaseTypeChange,
} from "../helpers";

const mockOnChange = jest.fn();

const createMockData = (
  overrides: Partial<RentBlockData> = {},
): RentBlockData => ({
  monthlyRent: "2500",
  timeRentedMonths: "0",
  timeRentedYears: "1",
  vacancy: "5",
  vacancyType: "%",
  management: "8",
  managementType: "%",
  maintenance: "100",
  maintenanceType: "$",
  annualRentIncrease: "3",
  annualRentIncreaseType: "%",
  ...overrides,
});

describe("RentBlock Helpers", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("handleVacancyTypeChange", () => {
    it.concurrent(
      "converts percentage to dollar amount based on monthly rent",
      () => {
        const data = createMockData({
          monthlyRent: "2000",
          vacancy: "5",
          vacancyType: "%",
        });
        handleVacancyTypeChange(data, mockOnChange, "$");

        expect(mockOnChange).toHaveBeenCalledWith({
          ...data,
          vacancyType: "$",
          vacancy: "100",
        });
      },
    );

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        monthlyRent: "2000",
        vacancy: "100",
        vacancyType: "$",
      });
      handleVacancyTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        vacancyType: "%",
        vacancy: "5.00",
      });
    });

    it.concurrent("handles monthly rent with currency formatting", () => {
      const data = createMockData({
        monthlyRent: "$2,500",
        vacancy: "10",
        vacancyType: "%",
      });
      handleVacancyTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        vacancyType: "$",
        vacancy: "250",
      });
    });

    it.concurrent("preserves value when switching to same type", () => {
      const data = createMockData({ vacancy: "5", vacancyType: "%" });
      handleVacancyTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        vacancyType: "%",
        vacancy: "5",
      });
    });

    it.concurrent("handles zero rent gracefully", () => {
      const data = createMockData({
        monthlyRent: "0",
        vacancy: "5",
        vacancyType: "%",
      });
      handleVacancyTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        vacancyType: "$",
        vacancy: "5",
      });
    });
  });

  describe("handleManagementTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        monthlyRent: "2000",
        management: "10",
        managementType: "%",
      });
      handleManagementTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        managementType: "$",
        management: "200",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        monthlyRent: "2000",
        management: "200",
        managementType: "$",
      });
      handleManagementTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        managementType: "%",
        management: "10.00",
      });
    });

    it.concurrent("handles empty rent gracefully", () => {
      const data = createMockData({
        monthlyRent: "",
        management: "100",
        managementType: "$",
      });
      handleManagementTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        managementType: "%",
        management: "100",
      });
    });
  });

  describe("handleMaintenanceTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        monthlyRent: "2000",
        maintenance: "5",
        maintenanceType: "%",
      });
      handleMaintenanceTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        maintenanceType: "$",
        maintenance: "100",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        monthlyRent: "2000",
        maintenance: "100",
        maintenanceType: "$",
      });
      handleMaintenanceTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        maintenanceType: "%",
        maintenance: "5.00",
      });
    });
  });

  describe("handleAnnualRentIncreaseTypeChange", () => {
    it.concurrent("converts percentage to dollar amount", () => {
      const data = createMockData({
        monthlyRent: "2000",
        annualRentIncrease: "3",
        annualRentIncreaseType: "%",
      });
      handleAnnualRentIncreaseTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        annualRentIncreaseType: "$",
        annualRentIncrease: "60",
      });
    });

    it.concurrent("converts dollar amount to percentage", () => {
      const data = createMockData({
        monthlyRent: "2000",
        annualRentIncrease: "60",
        annualRentIncreaseType: "$",
      });
      handleAnnualRentIncreaseTypeChange(data, mockOnChange, "%");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        annualRentIncreaseType: "%",
        annualRentIncrease: "3.00",
      });
    });

    it.concurrent("handles missing annualRentIncrease gracefully", () => {
      const data = createMockData({
        annualRentIncrease: "",
        annualRentIncreaseType: "%",
      });
      handleAnnualRentIncreaseTypeChange(data, mockOnChange, "$");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...data,
        annualRentIncreaseType: "$",
        annualRentIncrease: "0",
      });
    });

    it.concurrent(
      "handles missing annualRentIncreaseType (defaults to %)",
      () => {
        const data = createMockData({
          monthlyRent: "2000",
          annualRentIncrease: "3",
          annualRentIncreaseType: undefined as unknown as "$" | "%",
        });
        handleAnnualRentIncreaseTypeChange(data, mockOnChange, "$");

        expect(mockOnChange).toHaveBeenCalledWith({
          ...data,
          annualRentIncreaseType: "$",
          annualRentIncrease: "60",
        });
      },
    );
  });
});
