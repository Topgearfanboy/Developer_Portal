import { renderHook, act } from "@testing-library/react";
import { useProjectSettings } from "../useProjectSettings";

describe("useProjectSettings", () => {
  it("uses sensible defaults when no initial settings are provided", () => {
    const { result } = renderHook(() => useProjectSettings());

    expect(result.current.selectedYears).toBe(30);
    expect(result.current.cashStrategy).toBe("profit");
    expect(result.current.idealCashHoldingBalance).toBe("10000");
    expect(result.current.estimatedHomeAppreciationRate).toBe("3");
    expect(result.current.purchaseDate).toBe(
      new Date().toISOString().split("T")[0],
    );
  });

  it("uses initial settings when provided", () => {
    const { result } = renderHook(() =>
      useProjectSettings({
        years: 15,
        cashStrategy: "paydown",
        idealCashHoldingBalance: 5000,
        estimatedHomeAppreciationRate: 5,
        purchaseDate: "2020-01-01",
      }),
    );

    expect(result.current.selectedYears).toBe(15);
    expect(result.current.cashStrategy).toBe("paydown");
    expect(result.current.idealCashHoldingBalance).toBe("5000");
    expect(result.current.estimatedHomeAppreciationRate).toBe("5");
    expect(result.current.purchaseDate).toBe("2020-01-01");
  });

  it("updates the projection years", () => {
    const { result } = renderHook(() => useProjectSettings());

    act(() => {
      result.current.setSelectedYears(20);
    });

    expect(result.current.selectedYears).toBe(20);
    expect(result.current.getProjectSettings().years).toBe(20);
  });

  it("updates the cash strategy", () => {
    const { result } = renderHook(() => useProjectSettings());

    act(() => {
      result.current.setCashStrategy("paydown");
    });

    expect(result.current.cashStrategy).toBe("paydown");
    expect(result.current.getProjectSettings().cashStrategy).toBe("paydown");
  });

  it("updates the ideal cash holding balance", () => {
    const { result } = renderHook(() => useProjectSettings());

    act(() => {
      result.current.setIdealCashHoldingBalance("25000");
    });

    expect(result.current.idealCashHoldingBalance).toBe("25000");
    expect(result.current.getProjectSettings().idealCashHoldingBalance).toBe(
      25000,
    );
  });

  it("updates the estimated home appreciation rate", () => {
    const { result } = renderHook(() => useProjectSettings());

    act(() => {
      result.current.setEstimatedHomeAppreciationRate("7");
    });

    expect(result.current.estimatedHomeAppreciationRate).toBe("7");
    expect(
      result.current.getProjectSettings().estimatedHomeAppreciationRate,
    ).toBe(7);
  });

  it("updates the purchase date", () => {
    const { result } = renderHook(() => useProjectSettings());

    act(() => {
      result.current.setPurchaseDate("2025-06-15");
    });

    expect(result.current.purchaseDate).toBe("2025-06-15");
    expect(result.current.getProjectSettings().purchaseDate).toBe("2025-06-15");
  });

  it("returns numeric values for money and rate fields via getProjectSettings", () => {
    const { result } = renderHook(() =>
      useProjectSettings({
        years: 10,
        cashStrategy: "profit",
        idealCashHoldingBalance: 15000,
        estimatedHomeAppreciationRate: 4,
        purchaseDate: "2023-03-01",
      }),
    );

    expect(result.current.getProjectSettings()).toEqual({
      years: 10,
      cashStrategy: "profit",
      idealCashHoldingBalance: 15000,
      estimatedHomeAppreciationRate: 4,
      purchaseDate: "2023-03-01",
    });
  });
});
