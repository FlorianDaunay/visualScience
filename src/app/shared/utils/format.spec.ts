import { countryName, formatCompactNumber, institutionTypeLabel } from "./format";

describe("format utils", () => {
  it("formats large numbers compactly", () => {
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatCompactNumber(12)).toBe("12");
  });

  it("resolves a country code to its display name", () => {
    expect(countryName("US")).toBe("United States");
    expect(countryName(null)).toBeNull();
  });

  it("gives every institution type a readable label", () => {
    expect(institutionTypeLabel("education")).toContain("University");
    expect(institutionTypeLabel("unknown-type")).toBe(institutionTypeLabel("other"));
  });
});
