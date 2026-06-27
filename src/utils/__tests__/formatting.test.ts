import { toTitleCase } from "../formatting";

describe("toTitleCase", () => {
  it("capitalizes each word", () => {
    expect(toTitleCase("los angeles county")).toBe("Los Angeles County");
  });

  it("lowercases the rest of each word", () => {
    expect(toTitleCase("LOS ANGELES COUNTY")).toBe("Los Angeles County");
  });

  it("handles mixed casing", () => {
    expect(toTitleCase("sAn FrAnCiScO cOuNtY")).toBe("San Francisco County");
  });

  it("trims leading and trailing whitespace", () => {
    expect(toTitleCase("  kings county  ")).toBe("Kings County");
  });

  it("collapses multiple spaces", () => {
    expect(toTitleCase("new  york   county")).toBe("New York County");
  });

  it("returns an empty string for empty input", () => {
    expect(toTitleCase("")).toBe("");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(toTitleCase("   ")).toBe("");
  });
});
