"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Role = "visitor" | "member" | "admin";
type Props = { siteName: string; navigationItems: { label: string; href: string }[]; contactEmail?: string; contactPhone?: string; whatsappUrl?: string };

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" /></svg>
  );
}

function LanguageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h12M10 3v2m4 0c-.7 4.2-3.2 7.3-7.5 9M6 8c1.1 2.7 3.5 4.9 6.5 6M14 20l4-10 4 10m-6.5-3h5" /></svg>;
}

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
            <button className="simple-menu-icon-button" type="button" onClick={() => setTheme((value) => value === "light" ? "dark" : "light")} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} title={theme === "light" ? "Dark mode" : "Light mode"}>
              <ThemeIcon dark={theme === "dark"} />
            </button>
            <button className="simple-menu-icon-button" type="button" onClick={() => setLanguage((value) => value === "en" ? "bn" : "en")} aria-label={language === "en" ? "Switch language to Bengali" : "Switch language to English"} title={language === "en" ? "বাংলা" : "English"}>
              <LanguageIcon />
              <span className="simple-language-value">{language.toUpperCase()}</span>
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
