import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuyBlock } from "../index";
import { createBuyBlock } from "@/test/factories";
import type { BuyBlockData } from "../../../types";

const mockOnChange = jest.fn();

const testData = createBuyBlock({
  cost: "350000",
  interestRate: "7.5",
  downpayment: "15",
  downpaymentType: "%",
  closingCosts: "5",
  closingCostsType: "%",
  propertyTaxes: "1.2",
  propertyTaxesType: "%",
  annualHoa: "0",
  homeownersInsurance: "1200",
  homeownersInsuranceType: "$",
  loanTerm: "15",
  customLoanTerm: "",
  loanTermYears: 15,
  interestOnlyOption: true,
  loanAnalysis: {
    incomeNeeded: "85000",
    maxLoanBasedOnArv: "400000",
    initialCash: "50000",
    savedForRenovation: "25000",
    minimumCashForProject: "75000",
  },
}).data as BuyBlockData;

describe("BuyBlock", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with test data values", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("$350,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("7.50%")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15.00%")).toBeInTheDocument();
  });

  it("calculates and displays the exact monthly payment breakdown", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    // Interest-only P&I: $297,500 * 7.5% / 12 = $1,859.38
    // Taxes: $350,000 * 1.2% / 12 = $350.00
    // Insurance: $1,200 / 12 = $100.00
    // Total: $2,309.38
    expect(screen.getByText("Monthly Payment")).toBeInTheDocument();
    expect(screen.getByText("$2,309.38")).toBeInTheDocument();
    expect(screen.getByText("Loan: $1859")).toBeInTheDocument();
    expect(screen.getByText("Tax: $350")).toBeInTheDocument();
    expect(screen.getByText("Insurance: $100")).toBeInTheDocument();
  });

  it("expands and shows exact purchase summary details", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const toggleButton = screen.getByRole("button", {
      name: /purchase summary/i,
    });
    await user.click(toggleButton);

    expect(screen.getByText("Purchase Price")).toBeInTheDocument();
    expect(screen.getByText("$350,000.00")).toBeInTheDocument();
    expect(screen.getByText("Loan Amount")).toBeInTheDocument();
    expect(screen.getByText("$297,500.00")).toBeInTheDocument();
    expect(screen.getByText("Down Payment")).toBeInTheDocument();
    expect(screen.getByText("$52,500.00")).toBeInTheDocument();
    expect(screen.getAllByText("Closing Costs").length).toBeGreaterThan(0);
    expect(screen.getByText("$17,500.00")).toBeInTheDocument();
    expect(screen.getByText("Total Cash Needed")).toBeInTheDocument();
    expect(screen.getByText("$70,000.00")).toBeInTheDocument();
  });

  it("toggles purchase summary section when clicked", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const toggleButton = screen.getByRole("button", {
      name: /purchase summary/i,
    });

    await user.click(toggleButton);
    expect(screen.getByText("Purchase Price")).toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.queryByText("Purchase Price")).not.toBeInTheDocument();
  });

  it("updates the cost field via the factory data-testid", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const costInput = screen.getByTestId("buy-cost");
    await user.clear(costInput);
    await user.type(costInput, "300000");
    await user.tab();

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ cost: "300000" }),
    );
  });

  it("updates the interest rate via the factory data-testid", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const rateInput = screen.getByTestId("buy-interest-rate");
    await user.clear(rateInput);
    await user.type(rateInput, "5.5");
    await user.tab();

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ interestRate: "5.5" }),
    );
  });

  it("toggles interest only option when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const checkbox = screen.getByLabelText(/interest only option/i);
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        interestOnlyOption: false,
      }),
    );
  });

  it("renders project planning section with values", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const toggleButton = screen.getByRole("button", {
      name: /project planning/i,
    });
    await user.click(toggleButton);

    expect(screen.getByText("Project Planning")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$85,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$400,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$50,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$25,000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("$75,000")).toBeInTheDocument();
  });

  it("calculates loan amount correctly", async () => {
    const user = userEvent.setup();
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    const toggleButton = screen.getByRole("button", {
      name: /purchase summary/i,
    });
    await user.click(toggleButton);

    expect(screen.getByText("$297,500.00")).toBeInTheDocument();
  });

  it("displays segmented progress bar for monthly payment breakdown", () => {
    render(<BuyBlock data={testData} onChange={mockOnChange} />);

    expect(screen.getByText("Loan: $1859")).toBeInTheDocument();
    expect(screen.getByText("Tax: $350")).toBeInTheDocument();
    expect(screen.getByText("Insurance: $100")).toBeInTheDocument();
  });
});
