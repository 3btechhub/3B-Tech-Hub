import type { CSSProperties } from "react";
import Link from "next/link";
import { getPublicSiteSettings } from "@/lib/public-site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getPublicSiteSettings();
  const visibleServices = settings.services.filter((service) => service.enabled);
  const brandStyle = {
    "--brand": settings.primaryColor,
    "--brand-dark": settings.primaryColor,
    "--brand-accent": settings.accentColor,
  } as CSSProperties;

  if (settings.maintenanceMode) {
    return (
      <main style={{ ...brandStyle, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f8fa" }}>
        <section style={{ maxWidth: 620, textAlign: "center", background: "white", border: "1px solid #e5e7eb", borderRadius: 20, padding: 36 }}>
          <div className="brand-mark" style={{ margin: "0 auto 18px" }}>3B</div>
          <h1>{settings.siteName}</h1>
          <p>{settings.announcementText || "We are making improvements. Please check back soon."}</p>
        </section>
      </main>
    );
  }

  return (
    <div style={brandStyle}>
      {settings.announcementEnabled && settings.announcementText && (
        <div style={{ padding: "9px 20px", textAlign: "center", background: settings.accentColor, color: "white", fontSize: 13, fontWeight: 700 }}>
          {settings.announcementUrl ? <a href={settings.announcementUrl}>{settings.announcementText}</a> : settings.announcementText}
        </div>
      )}
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label={`${settings.siteName} home`}>
            <span className="brand-mark">3B</span>
            <span>{settings.siteName}</span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            {settings.navigationItems.map((item, index) => <a href={item.href} key={`${item.href}-${index}`}>{item.label}</a>)}
          </nav>
          <a className="button" href="#contact">Get Support</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">{settings.tagline}</span>
              <h1>{settings.heroTitle}</h1>
              <p>{settings.heroSubtitle}</p>
              <div className="hero-actions">
                <a className="button" href="#services">Explore Services <span aria-hidden="true">→</span></a>
                <a className="button secondary" href="#contact">Contact Our Team</a>
              </div>
            </div>
            <aside className="hero-panel" aria-label="Service highlights">
              <h2>How can we help?</h2>
              <div className="quick-item"><span className="quick-icon">01</span><div><strong>Repair & Diagnose</strong><div className="muted">Find the right technical support</div></div></div>
              <div className="quick-item"><span className="quick-icon">02</span><div><strong>Service Booking</strong><div className="muted">Online booking is being prepared</div></div></div>
              <div className="quick-item"><span className="quick-icon">03</span><div><strong>Explore Products</strong><div className="muted">Product catalogue is being prepared</div></div></div>
            </aside>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">What we do</span>
              <h2>Technology services for everyday life</h2>
              <p>{settings.description}</p>
            </div>
            <div className="card-grid">
              {visibleServices.map((service, index) => (
                <article className="service-card" key={service.id}>
                  <div className="quick-icon" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="callout">
              <div>
                <span className="eyebrow">Three Brothers, one hub</span>
                <h2>Practical support. Clear communication.</h2>
                <p>{settings.description}</p>
              </div>
              <a className="button secondary" href="#contact">Get updates</a>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Get in touch</span>
              <h2>Contact and service booking</h2>
              <p>Contact the 3B TECH HUB team using the verified business channels below.</p>
            </div>
            <div style={{ display: "grid", gap: 10, color: "#475467" }}>
              {settings.contactEmail && <p>Email: <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>}
              {settings.contactPhone && <p>Phone: <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a></p>}
              {settings.whatsappUrl && <p><a href={settings.whatsappUrl} target="_blank" rel="noreferrer">Contact us on WhatsApp ↗</a></p>}
              {settings.address && <p>Address: {settings.address}</p>}
              {!settings.contactEmail && !settings.contactPhone && !settings.whatsappUrl && !settings.address && <p className="muted">Official contact details will appear here after the owner saves them in Site Settings.</p>}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div><strong>{settings.siteName}</strong><p>{settings.tagline}</p></div>
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
