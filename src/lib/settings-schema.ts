import { z } from "zod";

export const supportedLocales = ["en", "bn"] as const;
export const supportedCurrencies = ["SAR", "BDT"] as const;

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  defaultLocale: z.enum(supportedLocales),
  enabledLocales: z.array(z.enum(supportedLocales)).min(1).max(2),
  defaultCurrency: z.enum(supportedCurrencies),
  enabledCurrencies: z.array(z.enum(supportedCurrencies)).min(1).max(2),
  contactEmail: z.union([z.email(), z.literal("")]),
  maintenanceMode: z.boolean(),
}).superRefine((settings, context) => {
  if (!settings.enabledLocales.includes(settings.defaultLocale)) {
    context.addIssue({
      code: "custom",
      path: ["defaultLocale"],
      message: "The default language must be enabled.",
    });
  }
  if (!settings.enabledCurrencies.includes(settings.defaultCurrency)) {
    context.addIssue({
      code: "custom",
      path: ["defaultCurrency"],
      message: "The default currency must be enabled.",
    });
  }
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// Proposed launch defaults only. Confirm with the owner before production use.
export const proposedSiteSettings: SiteSettings = {
  siteName: "3B TECH HUB",
  defaultLocale: "en",
  enabledLocales: ["en", "bn"],
  defaultCurrency: "SAR",
  enabledCurrencies: ["SAR", "BDT"],
  contactEmail: "",
  maintenanceMode: false,
};
