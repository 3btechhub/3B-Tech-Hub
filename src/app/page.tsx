import SiteHeader from "@/components/site-header";
import { getPublicSiteSettings } from "@/lib/public-site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getPublicSiteSettings();

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
      <main className="home-clean-surface" aria-label="Home" />
      <footer className="site-footer">
        <div className="container footer-inner footer-inner-clean">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
