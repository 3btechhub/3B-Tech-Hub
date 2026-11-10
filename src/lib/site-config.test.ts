import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "./site-config";

describe("normalizeSiteUrl", () => {
  it("normalizes a valid HTTPS URL to its origin", () => {
    expect(normalizeSiteUrl("https://www.example.com/path?q=1")).toBe(
      "https://www.example.com",
    );
  });

  it("rejects non-web protocols", () => {
    expect(normalizeSiteUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects invalid URLs", () => {
    expect(normalizeSiteUrl("not a url")).toBeNull();
  });
});
