"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

type Props = {
  children: ReactNode;
  siteName: string;
  navigationItems: { label: string; href: string }[];
};

export default function SiteShell({ children, siteName, navigationItems }: Props) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/admin")
    || pathname.startsWith("/login")
    || pathname.startsWith("/profile")
    || pathname.startsWith("/api");

  return (
    <>
      {!hideChrome && <SiteHeader siteName={siteName} navigationItems={navigationItems} />}
      {children}
      {!hideChrome && <SiteFooter siteName={siteName} />}
    </>
  );
}
