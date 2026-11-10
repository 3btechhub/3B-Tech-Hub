export const siteConfig = {
  name: "3B TECH HUB",
  tagline: "Three Brothers · Technology Hub",
  description:
    "Technology services, electronics repair and practical support from 3B TECH HUB.",
  navigation: [
    { label: "Services", href: "/#services" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

export function normalizeSiteUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}
