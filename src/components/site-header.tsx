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

const quickLinks = [
  { label: "Home", href: "/", description: "Back to the homepage", icon: "⌂" },
  { label: "Our Services", href: "#services", description: "Explore repair and technical services", icon: "⚙" },
  { label: "About 3B TECH HUB", href: "#about", description: "Learn about Three Brothers", icon: "✦" },
  { label: "Contact & Support", href: "#contact", description: "Find our verified contact channels", icon: "◉" },
];

export default function SiteHeader({ siteName, navigationItems, contactEmail, contactPhone, whatsappUrl }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label={siteName + " home"} onClick={closeMenu}>
          <span className="brand-mark">3B</span><span>{siteName}</span>
        </Link>
        <button type="button" className="menu-trigger" aria-expanded={open} aria-controls="site-floating-menu" onClick={() => setOpen((value) => !value)}>
          <span className={"menu-trigger-icon " + (open ? "is-open" : "")} aria-hidden="true"><span /><span /><span /></span>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </div>
      {open && (
        <>
          <button className="menu-backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />
          <section className="floating-menu container" id="site-floating-menu" aria-label="Website menu">
            <div className="floating-menu-heading">
              <div><span className="eyebrow">Explore 3B TECH HUB</span><h2>Where would you like to go?</h2><p>Quick access to services, information and support.</p></div>
              <button type="button" className="menu-close" onClick={closeMenu} aria-label="Close menu">×</button>
            </div>
            <div className="floating-menu-grid">
              <div className="floating-menu-section">
                <h3>Explore</h3>
                <div className="floating-menu-links">
                  {quickLinks.map((item) => (
                    <a className="floating-menu-link" href={item.href} key={item.href} onClick={closeMenu}>
                      <span className="floating-menu-icon" aria-hidden="true">{item.icon}</span>
                      <span><strong>{item.label}</strong><small>{item.description}</small></span><span className="floating-menu-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                  {navigationItems.filter((item) => !quickLinks.some((quick) => quick.href === item.href)).map((item, index) => (
                    <a className="floating-menu-link compact" href={item.href} key={item.href + "-" + index} onClick={closeMenu}>
                      <span><strong>{item.label}</strong></span><span className="floating-menu-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
              <aside className="floating-menu-section support-panel">
                <h3>Need assistance?</h3><p>Choose a verified contact channel to reach the 3B TECH HUB team.</p>
                <a className="support-action" href="#contact" onClick={closeMenu}><span>◎</span><span><strong>Contact & Support</strong><small>View all available contact details</small></span><b>→</b></a>
                {contactPhone && <a className="support-action" href={"tel:" + contactPhone}><span>☎</span><span><strong>Call us</strong><small>{contactPhone}</small></span><b>↗</b></a>}
                {whatsappUrl && <a className="support-action" href={whatsappUrl} target="_blank" rel="noreferrer"><span>◌</span><span><strong>WhatsApp</strong><small>Chat with our team</small></span><b>↗</b></a>}
                {contactEmail && <a className="support-action" href={"mailto:" + contactEmail}><span>✉</span><span><strong>Email</strong><small>{contactEmail}</small></span><b>↗</b></a>}
                <Link className="menu-admin-link" href="/login" onClick={closeMenu}>Owner / Admin Login <span>→</span></Link>
              </aside>
            </div>
            <div className="floating-menu-footer"><span>3B TECH HUB</span><span>Three Brothers · Technical Hub</span></div>
          </section>
        </>
      )}
    </header>
  );
}
