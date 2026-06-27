import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyTypeSelect } from "./index";

const mockOnChange = jest.fn();

describe("CurrencyTypeSelect", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  function renderSelect(value: "$" | "%") {
    return render(<CurrencyTypeSelect value={value} onChange={mockOnChange} />);
  }

  it("renders with dollar sign selected by default", () => {
    renderSelect("$");

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("$");
    expect(screen.getByRole("option", { name: "$" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "%" })).toBeInTheDocument();
  });

  it("renders with percentage sign when selected", () => {
    renderSelect("%");

    expect(screen.getByRole("combobox")).toHaveValue("%");
  });

  it("calls onChange when the user selects percentage", async () => {
    const user = userEvent.setup();
    renderSelect("$");

    await user.selectOptions(screen.getByRole("combobox"), "%");

    expect(mockOnChange).toHaveBeenCalledWith("%");
  });

  it("calls onChange when the user selects dollar", async () => {
    const user = userEvent.setup();
    renderSelect("%");

    await user.selectOptions(screen.getByRole("combobox"), "$");

    expect(mockOnChange).toHaveBeenCalledWith("$");
  });

  it("supports the combined variant", () => {
    render(
      <CurrencyTypeSelect
        value="$"
        onChange={mockOnChange}
        variant="combined"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("$");
  });
});
