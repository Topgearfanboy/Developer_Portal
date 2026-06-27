import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { RefinanceBlock } from "../index";
import type { RefinanceBlockData } from "../../../types";

const mockOnChange = jest.fn();

function renderWithState(
  initialData: RefinanceBlockData,
): jest.Mock<(data: RefinanceBlockData) => void> {
  const spy = jest.fn();
  function Wrapper() {
    const [data, setData] = useState(initialData);
    return (
      <RefinanceBlock
        data={data}
        onChange={(newData) => {
          setData(newData);
          spy(newData);
        }}
      />
    );
  }
  render(<Wrapper />);
  return spy;
}

const createMockData = (
  overrides: Partial<RefinanceBlockData> = {},
): RefinanceBlockData => ({
  cashOut: false,
  estimatedValue: "400000",
  remainingEquityAmount: "80000",
  remainingEquityPercent: "20",
  cost: "320000",
  costType: "$",
  interestRate: "6.5",
  closingCosts: "3",
  closingCostsType: "%",
  propertyTaxes: "4000",
  propertyTaxesType: "$",
  homeownersInsurance: "1200",
  homeownersInsuranceType: "$",
  loanTerm: "30",
  customLoanTerm: "",
  interestOnlyOption: false,
  loanTermYears: 30,
  loanStartDate: "",
  monthlyPayment: undefined,
  annualHoa: "0",
  ...overrides,
});

function getMonthlyPaymentText(): string | null {
  return screen.getByTestId("monthly-payment-summary").textContent;
}

describe("RefinanceBlock", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders the component without crashing", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Refinance Type")).toBeInTheDocument();
    });

    it("renders refinance type radio buttons", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Non Cash-out")).toBeInTheDocument();
      expect(screen.getByText("Cash Out")).toBeInTheDocument();
    });

    it("renders estimated value field with formatted value", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Estimated Value")).toBeInTheDocument();
      expect(screen.getByDisplayValue("$400,000")).toBeInTheDocument();
    });

    it("renders interest rate field with formatted value", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Interest Rate")).toBeInTheDocument();
      expect(screen.getByDisplayValue("6.50%")).toBeInTheDocument();
    });

    it("renders financed amount field with formatted value", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Financed Amount")).toBeInTheDocument();
      expect(screen.getByDisplayValue("$320,000")).toBeInTheDocument();
    });

    it("renders closing costs field with formatted value", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Closing Costs")).toBeInTheDocument();
      expect(screen.getByDisplayValue("3.00%")).toBeInTheDocument();
    });

    it("renders loan term button group", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Loan Term")).toBeInTheDocument();
    });

    it("renders property taxes field with formatted value", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Property Taxes (Annual)")).toBeInTheDocument();
      expect(screen.getByDisplayValue("$4,000")).toBeInTheDocument();
    });

    it("renders insurance field with formatted value", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Insurance (Annual)")).toBeInTheDocument();
      expect(screen.getByDisplayValue("$1,200")).toBeInTheDocument();
    });

    it("renders interest only checkbox", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Interest Only Loan")).toBeInTheDocument();
    });

    it("renders monthly payment section", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Monthly Payment")).toBeInTheDocument();
    });

    it("renders remaining equity section", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Remaining Equity")).toBeInTheDocument();
    });
  });

  describe("Refinance Type Selection", () => {
    it("selects non cash-out by default", () => {
      const data = createMockData({ cashOut: false });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons[0]).toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
    });

    it("calls onChange when cash-out is selected", async () => {
      const user = userEvent.setup();
      const data = createMockData({ cashOut: false });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      await user.click(screen.getByRole("radio", { name: "Cash Out" }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cashOut: true }),
      );
    });

    it("calls onChange when non cash-out is selected", async () => {
      const user = userEvent.setup();
      const data = createMockData({ cashOut: true });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      await user.click(screen.getByRole("radio", { name: "Non Cash-out" }));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cashOut: false }),
      );
    });
  });

  describe("Interest Only Option", () => {
    it("toggles interest only checkbox", async () => {
      const user = userEvent.setup();
      const data = createMockData({ interestOnlyOption: false });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      await user.click(
        screen.getByRole("checkbox", { name: "Interest Only Loan" }),
      );

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ interestOnlyOption: true }),
      );
    });
  });

  describe("Custom Loan Term", () => {
    it("shows custom input when custom loan term is selected", () => {
      const data = createMockData({ loanTerm: "custom" });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText("Enter years")).toBeInTheDocument();
    });

    it("does not show custom input when standard loan term is selected", () => {
      const data = createMockData({ loanTerm: "30" });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(
        screen.queryByPlaceholderText("Enter years"),
      ).not.toBeInTheDocument();
    });

    it("accepts numeric input for custom loan term", async () => {
      const user = userEvent.setup();
      const spy = renderWithState(
        createMockData({ loanTerm: "custom", customLoanTerm: "" }),
      );

      const input = screen.getByPlaceholderText("Enter years");
      await user.type(input, "25");

      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({ customLoanTerm: "25" }),
      );
    });

    it("filters non-numeric characters from custom loan term", async () => {
      const user = userEvent.setup();
      const spy = renderWithState(
        createMockData({ loanTerm: "custom", customLoanTerm: "" }),
      );

      const input = screen.getByPlaceholderText("Enter years");
      await user.type(input, "25abc");

      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({ customLoanTerm: "25" }),
      );
    });
  });

  describe("Remaining Equity", () => {
    it("displays remaining equity section", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);
      expect(screen.getByText("Remaining Equity")).toBeInTheDocument();
    });

    it("toggles remaining equity details on click", async () => {
      const user = userEvent.setup();
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      const toggleButton = screen.getByRole("button", {
        name: "Remaining Equity",
      });
      await user.click(toggleButton);

      // After clicking, the details should be visible
      expect(screen.getByText("Amount ($)")).toBeInTheDocument();
    });
  });

  describe("Remaining Equity Section", () => {
    it("renders remaining equity section title", () => {
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      expect(screen.getByText("Remaining Equity")).toBeInTheDocument();
    });

    it("shows remaining equity fields when expanded", async () => {
      const user = userEvent.setup();
      const data = createMockData();
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Click to expand the section
      const toggleButton = screen.getByRole("button", {
        name: "Remaining Equity",
      });
      await user.click(toggleButton);

      expect(screen.getByText("Amount ($)")).toBeInTheDocument();
      expect(screen.getByText("Percentage (%)")).toBeInTheDocument();
    });
  });

  describe("Monthly Payment Calculation", () => {
    it("calculates monthly payment correctly with 0% interest rate", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // With 0% interest, $240,000 loan over 30 years = $240,000 / 360 = $666.67
      expect(getMonthlyPaymentText()).toContain("$666.67");
    });

    it("calculates monthly payment correctly with percentage financed amount", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "80",
        costType: "%",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // 80% of $300,000 = $240,000 loan
      // With 0% interest over 30 years = $240,000 / 360 = $666.67
      expect(getMonthlyPaymentText()).toContain("$666.67");
    });

    it("produces same monthly payment for equivalent % and $ financed amounts", () => {
      // Test with dollar amount
      const dataDollar = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "6.5",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      const { rerender } = render(
        <RefinanceBlock data={dataDollar} onChange={mockOnChange} />,
      );
      const monthlyPaymentDollar = getMonthlyPaymentText();

      // Test with equivalent percentage
      const dataPercent = createMockData({
        estimatedValue: "300000",
        cost: "80",
        costType: "%",
        interestRate: "6.5",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      rerender(<RefinanceBlock data={dataPercent} onChange={mockOnChange} />);
      const monthlyPaymentPercent = getMonthlyPaymentText();

      expect(monthlyPaymentDollar).toBe(monthlyPaymentPercent);
    });

    it("includes property taxes in monthly payment when set as dollar amount", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "3600",
        propertyTaxesType: "$",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Loan: $666.67 + Taxes: $300 = $966.67
      expect(getMonthlyPaymentText()).toContain("$966.67");
    });

    it("includes property taxes in monthly payment when set as percentage", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "1.5",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Loan: $666.67 + Taxes: ($300,000 * 0.015 / 12) = $375 = $1,041.67
      expect(getMonthlyPaymentText()).toContain("$1,041.67");
    });

    it("includes insurance in monthly payment", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "0",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "1200",
        homeownersInsuranceType: "$",
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Loan: $666.67 + Insurance: $100 = $766.67
      expect(getMonthlyPaymentText()).toContain("$766.67");
    });

    it("calculates interest-only payment correctly", () => {
      const data = createMockData({
        estimatedValue: "300000",
        cost: "240000",
        costType: "$",
        interestRate: "6",
        loanTerm: "30",
        closingCosts: "0",
        closingCostsType: "%",
        propertyTaxes: "0",
        propertyTaxesType: "%",
        homeownersInsurance: "0",
        homeownersInsuranceType: "$",
        interestOnlyOption: true,
      });
      render(<RefinanceBlock data={data} onChange={mockOnChange} />);

      // Interest only: $240,000 * 0.06 / 12 = $1,200
      expect(getMonthlyPaymentText()).toContain("$1,200");
    });
  });
});
