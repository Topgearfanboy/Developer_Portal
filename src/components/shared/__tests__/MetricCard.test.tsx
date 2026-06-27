import { render, screen } from "@testing-library/react";
import { MetricCard } from "../MetricCard";

describe("MetricCard", () => {
  it("renders the label and value", () => {
    render(
      <MetricCard label="Total Profit" value={125000} format="currency" />,
    );

    expect(screen.getByText("Total Profit")).toBeInTheDocument();
    expect(screen.getByText("$125,000")).toBeInTheDocument();
  });

  it("formats values as percentages", () => {
    render(<MetricCard label="ROI" value={12.5} format="percentage" />);

    expect(screen.getByText("12.50%")).toBeInTheDocument();
  });

  it("formats values as currency without decimals", () => {
    render(<MetricCard label="Cash Flow" value={1500.75} format="currency" />);

    expect(screen.getByText("$1,501")).toBeInTheDocument();
  });

  it("formats duration values in years and months", () => {
    const { rerender } = render(
      <MetricCard label="Time to Pay Off" value={18} format="duration" />,
    );
    expect(screen.getByText("1y 6m")).toBeInTheDocument();

    rerender(
      <MetricCard label="Time to Pay Off" value={24} format="duration" />,
    );
    expect(screen.getByText("2y")).toBeInTheDocument();

    rerender(
      <MetricCard label="Time to Pay Off" value={5} format="duration" />,
    );
    expect(screen.getByText("5m")).toBeInTheDocument();
  });

  it("renders a placeholder for null values", () => {
    render(<MetricCard label="Empty" value={null} />);
    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("renders a help button when a known label is provided", () => {
    render(<MetricCard label="ROI" value={10} format="percentage" />);

    expect(screen.getByLabelText("Help for ROI")).toBeInTheDocument();
  });

  it("renders a help button when a custom tooltip is provided", () => {
    render(
      <MetricCard
        label="Custom"
        value={42}
        tooltip={{
          description: "Custom description",
          formula: "x + y",
        }}
      />,
    );

    expect(screen.getByLabelText("Help for Custom")).toBeInTheDocument();
  });

  it("defaults to plain text formatting", () => {
    render(<MetricCard label="Notes" value="Active" />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
