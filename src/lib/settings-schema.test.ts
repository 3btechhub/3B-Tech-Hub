import { describe, expect, it } from "vitest";
import { proposedSiteSettings, siteSettingsSchema } from "./settings-schema";

describe("siteSettingsSchema", () => {
  it("accepts the proposed bilingual, multi-currency defaults", () => {
    expect(siteSettingsSchema.safeParse(proposedSiteSettings).success).toBe(true);
  });

  it("rejects a default locale that is not enabled", () => {
    const result = siteSettingsSchema.safeParse({
      ...proposedSiteSettings,
      enabledLocales: ["bn"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid contact email addresses", () => {
    const result = siteSettingsSchema.safeParse({
      ...proposedSiteSettings,
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
