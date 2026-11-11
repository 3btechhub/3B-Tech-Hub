import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import SiteShell from "@/components/site-shell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const title = settings.seoTitle || settings.siteName;
  const description = settings.seoDescription || settings.description;
  const images = settings.ogImageUrl ? [{ url: settings.ogImageUrl }] : undefined;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: { default: title, template: `%s | ${settings.siteName}` },
    description,
    applicationName: settings.siteName,
    ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
    openGraph: {
      type: "website",
      ...(siteUrl ? { url: siteUrl } : {}),
      siteName: settings.siteName,
      title,
      description,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSiteSettings();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    ...(siteUrl ? { url: siteUrl } : {}),
    description: settings.description,
    email: settings.contactEmail || undefined,
    telephone: settings.contactPhone || undefined,
    address: settings.address || undefined,
  };

  return (
    <html lang={settings.defaultLocale}>
      <body>
        <SiteShell siteName={settings.siteName} navigationItems={settings.navigationItems}>{children}</SiteShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
