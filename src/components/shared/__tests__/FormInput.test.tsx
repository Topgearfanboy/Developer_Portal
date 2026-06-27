import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { FormInput } from "../FormInput";

describe("FormInput", () => {
  it("renders the label and input", () => {
    render(
      <FormInput id="name" label="Name" value="Test" onChange={() => {}} />,
    );

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
  });

  it("renders a prefix when provided", () => {
    render(
      <FormInput label="Price" prefix="$" value="100" onChange={() => {}} />,
    );

    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders a suffix when provided", () => {
    render(<FormInput label="Rate" suffix="%" value="5" onChange={() => {}} />);

    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("displays an error message when provided", () => {
    render(
      <FormInput label="Email" value="" error="Required" onChange={() => {}} />,
    );

    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("forwards the input value to onChange", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    function ControlledInput() {
      const [value, setValue] = useState("");
      return (
        <FormInput
          id="name"
          label="Name"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            handleChange(e.target.value);
          }}
        />
      );
    }

    render(<ControlledInput />);

    const input = screen.getByLabelText("Name");
    await user.type(input, "Hello");

    expect(input).toHaveValue("Hello");
    expect(handleChange).toHaveBeenLastCalledWith("Hello");
  });
});
