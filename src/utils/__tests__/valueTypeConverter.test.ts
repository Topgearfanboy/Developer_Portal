import {
  convertValueType,
  createTypeChangeHandler,
  type ValueType,
} from "../valueTypeConverter";

interface TestData {
  amount: string;
  amountType: ValueType;
}

describe("convertValueType", () => {
  it("returns the original value when types are the same", () => {
    expect(convertValueType("20", "%", "%", 100000)).toBe("20");
    expect(convertValueType("50000", "$", "$", 100000)).toBe("50000");
  });

  it("converts percentage to dollar amount", () => {
    expect(convertValueType("20", "%", "$", 100000)).toBe("20000");
  });

  it("converts dollar amount to percentage", () => {
    expect(convertValueType("20000", "$", "%", 100000)).toBe("20.00");
  });

  it("returns the original value when the base amount is zero", () => {
    expect(convertValueType("20", "%", "$", 0)).toBe("20");
  });

  it("uses custom percentage decimals", () => {
    expect(convertValueType("25000", "$", "%", 100000, { percentageDecimals: 4 })).toBe("25.0000");
  });
});

describe("createTypeChangeHandler", () => {
  it("creates a handler that updates the data object", () => {
    const data: TestData = { amount: "20", amountType: "%" };
    const onChange = jest.fn();
    const handler = createTypeChangeHandler<TestData>(data, onChange, {
      typeField: "amountType",
      valueField: "amount",
      getBaseAmount: () => 100000,
    });

    handler("$");

    expect(onChange).toHaveBeenCalledWith({
      amount: "20000",
      amountType: "$",
    });
  });
});
