import { z } from "zod";

export const supportedLocales = ["en", "bn"] as const;
export const supportedCurrencies = ["SAR", "BDT"] as const;

const httpsOrEmpty = z.union([
  z.url().refine((value) => new URL(value).protocol === "https:"),
  z.literal(""),
]);
const safeHref = z.string().trim().max(300).regex(/^(https:\/\/|\/(?!\/)|#)/, "Use an HTTPS URL, local path or page anchor.");

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(120),
  description: z.string().trim().max(300),
  defaultLocale: z.enum(supportedLocales),
  enabledLocales: z.array(z.enum(supportedLocales)).min(1).max(2),
  defaultCurrency: z.enum(supportedCurrencies),
  enabledCurrencies: z.array(z.enum(supportedCurrencies)).min(1).max(2),
  contactEmail: z.union([z.email(), z.literal("")]),
  contactPhone: z.string().trim().max(40),
  whatsappUrl: httpsOrEmpty,
  address: z.string().trim().max(300),
  heroTitle: z.string().trim().min(2).max(120),
  heroSubtitle: z.string().trim().max(300),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(200),
  ogImageUrl: httpsOrEmpty,
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  maintenanceMode: z.boolean(),
  announcementEnabled: z.boolean(),
  announcementText: z.string().trim().max(180),
  announcementUrl: z.union([safeHref, z.literal("")]),
  navigationItems: z.array(z.object({
    label: z.string().trim().min(1).max(40),
    href: safeHref.min(1).max(200),
  })).max(12),
  services: z.array(z.object({
    id: z.string().trim().min(1).max(40),
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().max(240),
    enabled: z.boolean(),
  })).max(24),
}).superRefine((settings, context) => {
  if (!settings.enabledLocales.includes(settings.defaultLocale)) {
    context.addIssue({ code: "custom", path: ["defaultLocale"], message: "The default language must be enabled." });
  }
  if (!settings.enabledCurrencies.includes(settings.defaultCurrency)) {
    context.addIssue({ code: "custom", path: ["defaultCurrency"], message: "The default currency must be enabled." });
  }
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const proposedSiteSettings: SiteSettings = {
  siteName: "3B TECH HUB",
  tagline: "Three Brothers · Technology Hub",
  description: "Technology services, electronics repair, mobile, TV, computer and satellite support.",
  defaultLocale: "en",
  enabledLocales: ["en", "bn"],
  defaultCurrency: "SAR",
  enabledCurrencies: ["SAR", "BDT"],
  contactEmail: "",
  contactPhone: "",
  whatsappUrl: "",
  address: "",
  heroTitle: "Technology solutions. Built on trust.",
  heroSubtitle: "Your destination for electronics repair, mobile services, TV support, satellite solutions and practical technology products.",
  seoTitle: "3B TECH HUB | Technology & Repair Services",
  seoDescription: "3B TECH HUB — technology services, electronics repair, mobile, TV, computer and satellite support.",
  ogImageUrl: "",
  primaryColor: "#0b5cab",
  accentColor: "#155eef",
  maintenanceMode: false,
  announcementEnabled: false,
  announcementText: "",
  announcementUrl: "",
  navigationItems: [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  services: [
    { id: "tv", title: "TV & Display Repair", description: "Troubleshooting and repair support for televisions, screens and display-related issues.", enabled: true },
    { id: "mobile", title: "Mobile Phone Services", description: "Mobile diagnostics, repair support and accessories for everyday devices.", enabled: true },
    { id: "satellite", title: "Satellite & Dish Setup", description: "Satellite dish installation, signal alignment and reception troubleshooting.", enabled: true },
    { id: "electronics", title: "Computer & Electronics", description: "Technical support for computers, electronics and connected devices.", enabled: true },
    { id: "products", title: "Accessories & Products", description: "A future-ready catalogue for useful technology products and accessories.", enabled: true },
    { id: "consultation", title: "Technical Consultation", description: "Get guidance to identify the right service before arranging a repair.", enabled: true },
  ],
};
