import { render, screen, fireEvent } from "@testing-library/react";
import { NewPropertyForm } from "../NewPropertyForm";

describe("NewPropertyForm", () => {
  it("submits valid form data", () => {
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(
      <NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />,
    );

    fireEvent.change(screen.getByPlaceholderText("e.g., Downtown Apartment"), {
      target: { value: "Test Property" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g., 90210"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g., Los Angeles County"), {
      target: { value: "Test County" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Property" }));

    expect(handleSubmit).toHaveBeenCalledWith(
      "Test Property",
      "12345",
      "Test County",
    );
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("shows validation error for empty name and does not submit", () => {
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(
      <NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Property" }));

    expect(screen.getByText("Property name is required")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid zip code", () => {
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(
      <NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />,
    );

    fireEvent.change(screen.getByPlaceholderText("e.g., Downtown Apartment"), {
      target: { value: "Test Property" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g., 90210"), {
      target: { value: "invalid" },
    });
    fireEvent.blur(screen.getByPlaceholderText("e.g., 90210"));

    expect(
      screen.getByText(
        "Zip code must be 5 digits (e.g., 90210) or 5+4 format",
      ),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", () => {
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(
      <NewPropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleCancel).toHaveBeenCalled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
