import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrency,
} from "../currency";

describe("formatCurrency", () => {
  it.concurrent("should format plain numbers with dollar sign", () => {
    expect(formatCurrency("1000")).toBe("$1,000");
  });

  it.concurrent("should format numbers with decimals", () => {
    expect(formatCurrency("1000.50")).toBe("$1,001");
  });

  it.concurrent(
    "should format numbers with dollar sign already present",
    () => {
      expect(formatCurrency("$1000")).toBe("$1,000");
    },
  );

  it.concurrent("should format numbers with commas", () => {
    expect(formatCurrency("1,000,000")).toBe("$1,000,000");
  });

  it.concurrent("should handle negative numbers", () => {
    expect(formatCurrency("-1000")).toBe("-$1,000");
  });

  it.concurrent("should return empty string for non-numeric input", () => {
    expect(formatCurrency("abc")).toBe("");
  });

  it.concurrent("should return empty string for empty string", () => {
    expect(formatCurrency("")).toBe("");
  });

  it.concurrent("should handle large numbers", () => {
    expect(formatCurrency("1000000000")).toBe("$1,000,000,000");
  });

  it.concurrent("should handle small decimal numbers", () => {
    expect(formatCurrency("0.01")).toBe("$0");
  });

  it.concurrent("should strip non-numeric characters", () => {
    expect(formatCurrency("$abc1000xyz")).toBe("$1,000");
  });
});

describe("formatCurrencyInput", () => {
  it.concurrent("should format with commas for display", () => {
    expect(formatCurrencyInput("1000")).toBe("1,000");
  });

  it.concurrent("should preserve decimals up to 2 places", () => {
    expect(formatCurrencyInput("1000.50")).toBe("1,000.5");
  });

  it.concurrent("should round to 2 decimal places", () => {
    expect(formatCurrencyInput("1000.555")).toBe("1,000.56");
  });

  it.concurrent("should remove dollar sign", () => {
    expect(formatCurrencyInput("$1000")).toBe("1,000");
  });

  it.concurrent("should return empty string for non-numeric input", () => {
    expect(formatCurrencyInput("abc")).toBe("");
  });

  it.concurrent("should return empty string for empty string", () => {
    expect(formatCurrencyInput("")).toBe("");
  });

  it.concurrent("should handle large numbers", () => {
    expect(formatCurrencyInput("1000000")).toBe("1,000,000");
  });
});

describe("parseCurrency", () => {
  it.concurrent("should remove dollar sign", () => {
    expect(parseCurrency("$1000")).toBe("1000");
  });

  it.concurrent("should remove commas", () => {
    expect(parseCurrency("1,000,000")).toBe("1000000");
  });

  it.concurrent("should remove both dollar sign and commas", () => {
    expect(parseCurrency("$1,000,000")).toBe("1000000");
  });

  it.concurrent("should preserve decimal points", () => {
    expect(parseCurrency("$1,000.50")).toBe("1000.50");
  });

  it.concurrent("should return empty string for empty input", () => {
    expect(parseCurrency("")).toBe("");
  });

  it.concurrent("should handle plain numbers", () => {
    expect(parseCurrency("1000")).toBe("1000");
  });

  it.concurrent("should handle negative numbers", () => {
    expect(parseCurrency("-$1,000")).toBe("-1000");
  });
});
