import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://3btechhub.vercel.app";
const description =
  "3B TECH HUB — technology services, electronics repair, mobile, TV, computer and satellite support.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "3B TECH HUB | Technology & Repair Services",
    template: "%s | 3B TECH HUB",
  },
  description,
  applicationName: "3B TECH HUB",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "3B TECH HUB",
    title: "3B TECH HUB | Technology & Repair Services",
    description,
  },
  twitter: {
    card: "summary",
    title: "3B TECH HUB | Technology & Repair Services",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b5cab",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "3B TECH HUB",
  alternateName: "Three Brothers Technology Hub",
  url: siteUrl,
  description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
