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
    <main style={{ minHeight: "100vh", background: "#f4f6f9", padding: "40px 20px" }}>
      <div style={{ width: "min(1040px, 100%)", margin: "0 auto" }}>
        <Link href="/" style={{ color: "#0b5cab", fontWeight: 700 }}>← View public website</Link>
        <header style={{ margin: "28px 0" }}>
          <p style={{ color: "#0b5cab", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>3B TECH HUB · OWNER CONTROL CENTER</p>
          <h1 style={{ fontSize: 36, letterSpacing: "-.04em", margin: "8px 0" }}>Admin workspace</h1>
          <p style={{ color: "#667085", lineHeight: 1.7, maxWidth: 680 }}>
            Owner-controlled tools for website content, media and site-wide customization. Changes are protected by server-side Owner authentication and Appwrite audit records.
          </p>
        </header>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {areas.map((area) => {
            const card = (
              <article style={{ height: "100%", padding: 22, borderRadius: 16, background: "white", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: 11, color: "#0b5cab", fontWeight: 800, margin: 0 }}>{area.status.toUpperCase()}</p>
                <h2 style={{ fontSize: 18, margin: "12px 0 8px" }}>{area.title}</h2>
                <p style={{ fontSize: 14, color: "#667085", lineHeight: 1.6, margin: 0 }}>{area.description}</p>
                {area.href && <p style={{ color: "#0b5cab", fontSize: 13, fontWeight: 800, margin: "16px 0 0" }}>Open tools →</p>}
              </article>
            );
            return area.href ? <Link href={area.href} key={area.title} style={{ textDecoration: "none" }}>{card}</Link> : <div key={area.title}>{card}</div>;
          })}
        </section>
        <aside style={{ marginTop: 24, padding: 20, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, color: "#164a7b", lineHeight: 1.6 }}>
          <strong>Owner approval:</strong> Public publishing and site-wide changes remain under Owner control. Media uploads are private by default; choose Public only when an asset is intended for website delivery.
        </aside>
      </div>
    </main>
  );
}
