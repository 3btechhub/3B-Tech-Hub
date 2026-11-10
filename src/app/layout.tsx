import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "3B TECH HUB | Technology & Repair Services",
    template: "%s | 3B TECH HUB",
  },
  description:
    "3B TECH HUB — trusted technology, electronics repair, mobile, TV and satellite services.",
  applicationName: "3B TECH HUB",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b5cab",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
