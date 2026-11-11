"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const modules = [
  { label: "Overview", href: "/admin" },
  { label: "Service", href: "/admin/content" },
  { label: "Product" },
  { label: "Workshop" },
  { label: "Technician" },
  { label: "Media", href: "/admin/media" },
  { label: "User" },
  { label: "Role" },
  { label: "Permission" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminModuleNav() {
  const pathname = usePathname();

  return (
    <div className="admin-module-nav-shell">
      <nav className="admin-module-nav" aria-label="Admin modules">
        {modules.map((item) => {
          if (!item.href) {
            return (
              <span
                className="admin-module-link is-disabled"
                aria-disabled="true"
                title="This module is not available yet"
                key={item.label}
              >
                {item.label}
              </span>
            );
          }

          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              className={`admin-module-link${active ? " is-active" : ""}`}
              href={item.href}
              aria-current={active ? "page" : undefined}
              key={item.label}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
