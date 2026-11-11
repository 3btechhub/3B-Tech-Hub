"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Role = "visitor" | "member" | "admin";
type Props = { siteName: string; navigationItems: { label: string; href: string }[]; contactEmail?: string; contactPhone?: string; whatsappUrl?: string };
type SearchItem = { label: string; href: string };

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" /></svg>
  );
}

function LanguageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>;
}

export default function SiteHeader({ siteName, navigationItems }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role>("visitor");
  const [theme, setTheme] = useState<"light" | "dark">(() => typeof window === "undefined" ? "light" : window.localStorage.getItem("3b-theme") === "dark" ? "dark" : "light");
  const [language, setLanguage] = useState<"en" | "bn">(() => typeof window === "undefined" ? "en" : window.localStorage.getItem("3b-language") === "bn" ? "bn" : "en");
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    window.localStorage.setItem("3b-theme", theme);
    window.localStorage.setItem("3b-language", language);
  }, [theme, language]);

  useEffect(() => {
    let active = true;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active) return;
        setRole(data?.role === "admin" ? "admin" : data?.role === "member" ? "member" : "visitor");
      })
      .catch(() => { if (active) setRole("visitor"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!open && !searchOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (open && !menuRef.current?.contains(event.target) && !menuTriggerRef.current?.contains(event.target)) setOpen(false);
      if (searchOpen && !searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, searchOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const closeMenu = () => setOpen(false);
  const closeSearch = () => { setSearchOpen(false); setSearch(""); };
  const loggedIn = role === "member" || role === "admin";
  const searchItems: SearchItem[] = useMemo(() => [
    { label: "Home", href: "/" },
    ...navigationItems,
    ...(loggedIn ? [{ label: "Profile", href: "/profile" }] : []),
    { label: "Gallery", href: "/gallery" },
    ...(loggedIn ? [{ label: "Log Out", href: "/api/admin/logout" }] : [{ label: "Log In", href: "/login?next=%2Fprofile" }]),
    ...(role === "admin" ? [{ label: "Dashboard", href: "/admin" }] : []),
  ].filter((item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index), [loggedIn, role, navigationItems]);
  const suggestions = search.trim()
    ? searchItems.filter((item) => item.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).slice(0, 6)
    : searchItems.slice(0, 5);

  return (
    <header className="site-header" data-hydrated={hydrated ? "true" : "false"}>
      <nav className="container header-inner" aria-label="Main navigation">
        <div className="header-brand-group">
          <Link className="brand-logo" href="/" aria-label={siteName + " home"} onClick={() => { closeMenu(); closeSearch(); }}>
            <span className="brand-mark">3B</span>
          </Link>
          {!searchOpen && <span className="brand-title">{siteName}</span>}
        </div>

        <div className="header-actions">
          <div className={"header-search " + (searchOpen ? "is-open" : "")} ref={searchRef}>
            <button type="button" className="header-search-trigger" aria-label={searchOpen ? "Close search" : "Search"} aria-expanded={searchOpen} onClick={() => { setOpen(false); setSearchOpen((value) => !value); setSearch(""); }}>
              {searchOpen ? <span className="search-close-mark" aria-hidden="true">×</span> : <SearchIcon />}
            </button>
            {searchOpen && (
              <>
                <span className="header-search-divider" aria-hidden="true" />
                <input ref={searchInputRef} className="header-search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." aria-label="Search the website" aria-controls="site-search-suggestions" aria-autocomplete="list" />
                <div className="search-suggestions floating-menu" id="site-search-suggestions" role="listbox" aria-label="Search suggestions">
                  {suggestions.length > 0 ? suggestions.map((item) => (
                    <Link key={item.href} className="search-suggestion" href={item.href} role="option" onClick={() => { closeSearch(); closeMenu(); }}>{item.label}</Link>
                  )) : <p className="search-empty">No suggestions found</p>}
                </div>
              </>
            )}
          </div>

          <button ref={menuTriggerRef} type="button" className="menu-trigger" aria-expanded={open} aria-controls="site-floating-menu" onClick={() => { setSearchOpen(false); setSearch(""); setOpen((value) => !value); }}>
            <span className={"menu-trigger-icon " + (open ? "is-open" : "")} aria-hidden="true"><span /><span /><span /></span>
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </nav>
      {open && (
        <div ref={menuRef} className="floating-menu simple-menu" id="site-floating-menu" role="group" aria-label="Website menu">
          <div className="simple-menu-links">
            <Link className="simple-menu-link" href="/" onClick={closeMenu}>Home</Link>
            {loggedIn && <Link className="simple-menu-link" href="/profile" onClick={closeMenu}>Profile</Link>}
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
            </button>
          </div>
          {role === "admin" && <>
            <div className="simple-menu-divider" />
            <Link className="simple-menu-link simple-menu-dashboard" href="/admin" onClick={closeMenu}>Dashboard</Link>
          </>}
        </div>
      )}
    </header>
  );
}
