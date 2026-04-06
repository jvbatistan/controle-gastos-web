import { describe, expect, it } from "vitest";
import { getCardBrandPresentation, normalizeCardBrandName } from "@/lib/cardBrand";

describe("cardBrand", () => {
  it("normalizes names before matching the brand", () => {
    expect(normalizeCardBrandName("  Núbank   Black ")).toBe("nubank black");
  });

  it("returns a mapped local logo when the brand is known", () => {
    const brand = getCardBrandPresentation("Nubank Ultravioleta");

    expect(brand.logoSrc).toBe("/card-brands/nubank.svg");
    expect(brand.logoAlt).toBe("Logo do Nubank");
  });

  it("returns an elegant fallback when the brand is unknown", () => {
    const brand = getCardBrandPresentation("Meu Cartao Preferido");

    expect(brand.logoSrc).toBe(null);
    expect(brand.shortLabel).toBe("MC");
    expect(brand.solidColor).toBeTruthy();
    expect(brand.gradientClassName).toBeTruthy();
  });
});
