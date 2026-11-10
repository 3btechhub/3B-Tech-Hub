"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Role = "visitor" | "member" | "admin";
type Props = { siteName: string; navigationItems: { label: string; href: string }[]; contactEmail?: string; contactPhone?: string; whatsappUrl?: string };

export default function SiteHeader({ siteName }: Props) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>("visitor");
  const [theme, setTheme] = useState<"light" | "dark">(() => typeof window === "undefined" ? "light" : window.localStorage.getItem("3b-theme") === "dark" ? "dark" : "light");
  const [language, setLanguage] = useState<"en" | "bn">(() => typeof window === "undefined" ? "en" : window.localStorage.getItem("3b-language") === "bn" ? "bn" : "en");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    window.localStorage.setItem("3b-theme", theme);
    window.localStorage.setItem("3b-language", language);
  }, [theme, language]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data) return;
        setRole(data.role === "admin" ? "admin" : data.role === "member" ? "member" : "visitor");
      })
      .catch(() => { if (active) setRole("visitor"); });
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => { active = false; window.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const loggedIn = role === "member" || role === "admin";

  return (
    <header className="site-header">
      <nav className="container header-inner" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label={siteName + " home"} onClick={closeMenu}>
          <span className="brand-mark">3B</span><span>{siteName}</span>
        </Link>
        <button type="button" className="menu-trigger" aria-expanded={open} aria-controls="site-floating-menu" onClick={() => setOpen((value) => !value)}>
          <span className={"menu-trigger-icon " + (open ? "is-open" : "")} aria-hidden="true"><span /><span /><span /></span>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </nav>
      {open && <>
        <button className="menu-backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />
        <div className="floating-menu simple-menu container" id="site-floating-menu" role="group" aria-label="Website menu">
          <div className="simple-menu-links">
            <Link className="simple-menu-link" href="/" onClick={closeMenu}>Home</Link>
            <Link className="simple-menu-link" href="/profile" onClick={closeMenu}>Profile</Link>
            <Link className="simple-menu-link" href="/#services" onClick={closeMenu}>Services</Link>
            <Link className="simple-menu-link" href="/gallery" onClick={closeMenu}>Gallery</Link>
            {loggedIn
              ? <form action="/api/admin/logout" method="post"><button className="simple-menu-link simple-menu-action" type="submit">Log Out</button></form>
              : <Link className="simple-menu-link" href="/login?next=%2Fprofile" onClick={closeMenu}>Log In</Link>}
          </div>
          <div className="simple-menu-divider" />
          <div className="simple-menu-tools">
            <button className="simple-menu-toggle" type="button" onClick={() => setTheme((value) => value === "light" ? "dark" : "light")} aria-pressed={theme === "dark"}>
              <span>Dark/Light</span><span className={"simple-switch " + (theme === "dark" ? "is-on" : "")} aria-hidden="true"><span /></span>
            </button>
            <button className="simple-menu-toggle" type="button" onClick={() => setLanguage((value) => value === "en" ? "bn" : "en")} aria-pressed={language === "bn"}>
              <span>Language</span><span className="simple-language-value">{language.toUpperCase()}</span>
            </button>
          </div>
          {role === "admin" && <>
            <div className="simple-menu-divider" />
            <Link className="simple-menu-link simple-menu-dashboard" href="/admin" onClick={closeMenu}>Dashboard</Link>
          </>}
        </div>
      </>}
    </header>
  );
}
