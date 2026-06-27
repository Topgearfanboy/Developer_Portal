import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewPropertyForm } from "../NewPropertyForm";

describe("NewPropertyForm", () => {
  it("submits valid form data", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(<NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />);

    await user.type(screen.getByLabelText("Property Name"), "Test Property");
    await user.type(screen.getByLabelText("Zip Code"), "12345");
    await user.type(screen.getByLabelText("County"), "Test County");
    await user.click(screen.getByRole("button", { name: "Create Property" }));

    expect(handleSubmit).toHaveBeenCalledWith(
      "Test Property",
      "12345",
      "Test County",
    );
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("shows validation error for empty name and does not submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(<NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />);

    await user.click(screen.getByRole("button", { name: "Create Property" }));

    expect(screen.getByText("Property name is required")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid zip code", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(<NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />);

    await user.type(screen.getByLabelText("Property Name"), "Test Property");
    await user.type(screen.getByLabelText("Zip Code"), "invalid");
    await user.tab();

    expect(
      screen.getByText("Zip code must be 5 digits (e.g., 90210) or 5+4 format"),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(<NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleCancel).toHaveBeenCalled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
