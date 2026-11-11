import SiteHeader from "@/components/site-header";
import { getPublicSiteSettings } from "@/lib/public-site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getPublicSiteSettings();
  const services = settings.services.filter((service) => service.enabled);
  const quickServices = services.slice(0, 3);
  const contactLinks = [
    settings.whatsappUrl ? { label: "WhatsApp", href: settings.whatsappUrl } : null,
    settings.contactPhone ? { label: "Call us", href: `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}` } : null,
    settings.contactEmail ? { label: "Email", href: `mailto:${settings.contactEmail}` } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  if (settings.maintenanceMode) {
    return (
      <main className="maintenance-page">
        <section className="maintenance-card">
          <div className="brand-mark maintenance-brand-mark">3B</div>
          <h1>{settings.siteName}</h1>
          <p>{settings.announcementText || "We are making improvements. Please check back soon."}</p>
        </section>
      </main>
    );
  }

  return (
    <div className="site-shell">
      {settings.announcementEnabled && settings.announcementText && (
        <div className="site-announcement">
          {settings.announcementUrl ? <a href={settings.announcementUrl}>{settings.announcementText}</a> : settings.announcementText}
        </div>
      )}
      <SiteHeader
        siteName={settings.siteName}
        navigationItems={settings.navigationItems}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        whatsappUrl={settings.whatsappUrl}
      />
      <main aria-label="Home">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">{settings.tagline}</span>
              <h1>{settings.heroTitle}</h1>
              <p>{settings.heroSubtitle}</p>
              <div className="hero-actions">
                <a className="button" href="#services">Explore services</a>
                {contactLinks[0] && <a className="button secondary" href={contactLinks[0].href} target={contactLinks[0].href.startsWith("https://") ? "_blank" : undefined} rel={contactLinks[0].href.startsWith("https://") ? "noreferrer" : undefined}>Contact us</a>}
              </div>
            </div>
            <aside className="hero-panel">
              <h2>How we can help</h2>
              {quickServices.length > 0 ? quickServices.map((service) => (
                <div className="quick-item" key={service.id}>
                  <span className="quick-icon" aria-hidden="true">3B</span>
                  <div><strong>{service.title}</strong><p>{service.description}</p></div>
                </div>
              )) : <p>Our service information will be published here soon.</p>}
            </aside>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">WHAT WE DO</span>
              <h2>Technology services</h2>
              <p>Practical support for everyday devices, electronics and connected technology.</p>
            </div>
            <div className="card-grid">
              {services.map((service) => (
                <article className="service-card" key={service.id}>
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
                <span className="eyebrow">ABOUT {settings.siteName}</span>
                <h2>Technology help, made straightforward.</h2>
                <p>{settings.description}</p>
              </div>
              <a className="button secondary" href="#contact">Get in touch</a>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">CONTACT</span>
              <h2>How can we help?</h2>
              <p>Choose an available contact method to ask about a service or technical issue.</p>
            </div>
            <div className="callout">
              <div>
                {settings.contactPhone && <p><strong>Phone:</strong> {settings.contactPhone}</p>}
                {settings.contactEmail && <p><strong>Email:</strong> {settings.contactEmail}</p>}
                {settings.address && <p><strong>Address:</strong> {settings.address}</p>}
                {contactLinks.length === 0 && <p>Contact details are being prepared. Please check back soon.</p>}
              </div>
              {contactLinks.length > 0 && (
                <div className="hero-actions">
                  {contactLinks.map((link) => (
                    <a className="button secondary" href={link.href} key={link.label} target={link.href.startsWith("https://") ? "_blank" : undefined} rel={link.href.startsWith("https://") ? "noreferrer" : undefined}>{link.label}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner footer-inner-clean">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <p>{settings.tagline}</p>
        </div>
      </footer>
    </div>
  );
}
