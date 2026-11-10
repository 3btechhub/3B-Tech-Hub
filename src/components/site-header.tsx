"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavigationItem = { label: string; href: string };
type Props = {
  siteName: string;
  navigationItems: NavigationItem[];
  contactEmail?: string;
  contactPhone?: string;
  whatsappUrl?: string;
};

export default function SiteHeader({ siteName }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"en" | "bn">("en");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("3b-theme");
    const savedLanguage = window.localStorage.getItem("3b-language");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    if (savedLanguage === "bn" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    window.localStorage.setItem("3b-theme", theme);
    window.localStorage.setItem("3b-language", language);
  }, [theme, language]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data) return;
        setIsLoggedIn(Boolean(data.authenticated));
        setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (active) { setIsLoggedIn(false); setIsAdmin(false); }
      });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      active = false;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const bn = language === "bn";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label={siteName + " home"} onClick={closeMenu}>
          <span className="brand-mark">3B</span><span>{siteName}</span>
        </Link>
        <button type="button" className="menu-trigger" aria-expanded={open} aria-controls="site-floating-menu" onClick={() => setOpen((value) => !value)}>
          <span className={"menu-trigger-icon " + (open ? "is-open" : "")} aria-hidden="true"><span /><span /><span /></span>
          <span>{open ? (bn ? "বন্ধ" : "Close") : (bn ? "মেনু" : "Menu")}</span>
        </button>
      </div>
      {open && (
        <>
          <button className="menu-backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />
          <section className="floating-menu container" id="site-floating-menu" aria-label="Website menu">
            <div className="floating-menu-heading">
              <div><span className="eyebrow">3B TECH HUB</span><h2>{bn ? "আপনি কোথায় যেতে চান?" : "Where would you like to go?"}</h2><p>{bn ? "প্রয়োজনীয় লিংক ও সেটিংস এক জায়গায়।" : "Quick links and useful website controls."}</p></div>
              <button type="button" className="menu-close" onClick={closeMenu} aria-label="Close menu">×</button>
            </div>

            <div className="menu-columns">
              <section className="menu-group">
                <h3>{bn ? "সাধারণ লিংক" : "Normal Link"}</h3>
                <Link className="menu-item" href="/" onClick={closeMenu}>⌂ <span>Home</span></Link>
                {isLoggedIn && <Link className="menu-item" href="/profile" onClick={closeMenu}>◉ <span>Profile</span></Link>}
                <Link className="menu-item" href="/#services" onClick={closeMenu}>⚙ <span>Services</span></Link>
                <Link className="menu-item" href="/gallery" onClick={closeMenu}>▧ <span>Gallery</span></Link>
                {isLoggedIn && <form action="/api/admin/logout" method="post"><button className="menu-item menu-logout" type="submit">↪ <span>{bn ? "লগ আউট" : "Log Out"}</span></button></form>}
                {!isLoggedIn && <Link className="menu-item menu-login" href="/login" onClick={closeMenu}>↪ <span>{bn ? "প্রোফাইল লগইন" : "Profile Log In"}</span></Link>}
              </section>

              <section className="menu-group">
                <h3>Tools</h3>
                <button className="menu-item menu-control" type="button" onClick={() => setTheme((value) => value === "light" ? "dark" : "light")}>
                  {theme === "light" ? "☾" : "☀"} <span>{bn ? "ডে / নাইট" : "Day / Night Switch"}</span><small>{theme === "light" ? "Light" : "Dark"}</small>
                </button>
                <button className="menu-item menu-control" type="button" onClick={() => setLanguage((value) => value === "en" ? "bn" : "en")}>
                  文 <span>{bn ? "ভাষা পরিবর্তন" : "Language Switch"}</span><small>{language.toUpperCase()}</small>
                </button>
              </section>

              {isAdmin && (
                <section className="menu-group">
                  <h3>Admin Link</h3>
                  <Link className="menu-item admin-menu-item" href="/admin" onClick={closeMenu}>▣ <span>Dashboard</span><b>→</b></Link>
                </section>
              )}
            </div>
            <div className="floating-menu-footer"><span>3B TECH HUB</span><span>Three Brothers · Technical Hub</span></div>
          </section>
        </>
      )}
    </header>
  );
}
