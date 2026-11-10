import Link from "next/link";

export const metadata = {
  title: "Admin Workspace",
  robots: { index: false, follow: false },
};

const areas = [
  { title: "Website Content", description: "Create drafts, revise pages and submit owner-approved content for publishing.", status: "Content tools", href: "/admin/content" },
  { title: "Media Library", description: "Upload, optimize, publish, privately store and manage external media URLs.", status: "Media tools", href: "/admin/media" },
  { title: "Website Customization", description: "Edit homepage copy, brand colors, navigation, languages, currencies, contact, SEO and service cards.", status: "Live settings", href: "/admin/settings" },
  { title: "Services & Products", description: "Service cards are configurable now; full product catalogue and pricing workflows are next.", status: "Partial" },
  { title: "Bookings & Customers", description: "Booking and customer management requires its own data model and workflows.", status: "In development" },
  { title: "Users & Permissions", description: "Owner-only access is enforced. Delegated staff accounts and role assignment remain disabled.", status: "Owner only" },
  { title: "Approvals & Audit Log", description: "Publishing remains owner-controlled; every implemented administrative change is audited.", status: "Owner approval" },
];

export default function AdminWorkspacePage() {
  return (
    <main className="admin-workspace">
      <div className="admin-workspace-shell">
        <Link href="/" className="admin-back-link">← View public website</Link>
        <header className="admin-workspace-header">
          <p className="admin-workspace-eyebrow">3B TECH HUB · OWNER CONTROL CENTER</p>
          <h1>Admin workspace</h1>
          <p className="admin-workspace-intro">
            Owner-controlled tools for website content, media and site-wide customization. Changes are protected by server-side Owner authentication and Appwrite audit records.
          </p>
        </header>
        <section className="admin-area-grid">
          {areas.map((area) => {
            const card = (
              <article className="admin-area-card">
                <p className="admin-area-status">{area.status.toUpperCase()}</p>
                <h2>{area.title}</h2>
                <p className="admin-area-description">{area.description}</p>
                {area.href && <p className="admin-area-open">Open tools →</p>}
              </article>
            );
            return area.href ? <Link href={area.href} key={area.title} style={{ textDecoration: "none" }}>{card}</Link> : <div key={area.title}>{card}</div>;
          })}
        </section>
        <aside className="admin-owner-note">
          <strong>Owner approval:</strong> Public publishing and site-wide changes remain under Owner control. Media uploads are private by default; choose Public only when an asset is intended for website delivery.
        </aside>
      </div>
    </main>
  );
}
