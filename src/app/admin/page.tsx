import Link from "next/link";

export const metadata = {
  title: "Admin Workspace",
  robots: { index: false, follow: false },
};

const areas = [
  { title: "Website Content", description: "Manage pages, navigation, banners and reusable sections.", status: "Planned" },
  { title: "Media Library", description: "Manage uploads, external media URLs, image optimization and asset usage.", status: "Preview" },
  { title: "Services & Products", description: "Manage service listings, catalogue items and pricing.", status: "Planned" },
  { title: "Bookings & Customers", description: "Review enquiries, service requests and customer records.", status: "Planned" },
  { title: "Users & Permissions", description: "Manage staff access with role-based permissions.", status: "Planned" },
  { title: "SEO & Site Settings", description: "Configure metadata, languages, currencies and site-wide settings.", status: "Planned" },
  { title: "Approvals & Audit Log", description: "Review changes, approve previews and track publishing history.", status: "Owner approval" },
];

export default function AdminWorkspacePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f9", padding: "40px 20px" }}>
      <div style={{ width: "min(1040px, 100%)", margin: "0 auto" }}>
        <Link href="/" style={{ color: "#0b5cab", fontWeight: 700 }}>← View public website</Link>
        <header style={{ margin: "28px 0" }}>
          <p style={{ color: "#0b5cab", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>3B TECH HUB · CONTROL CENTER</p>
          <h1 style={{ fontSize: 36, letterSpacing: "-.04em", margin: "8px 0" }}>Admin workspace</h1>
          <p style={{ color: "#667085", lineHeight: 1.7, maxWidth: 680 }}>
            The owner-controlled administration area is being prepared. Authentication, server-side role checks and audit logging must be completed before administrative actions are enabled.
          </p>
        </header>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {areas.map((area) => (
            <article key={area.title} style={{ padding: 22, borderRadius: 16, background: "white", border: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 11, color: "#0b5cab", fontWeight: 800, margin: 0 }}>{area.status.toUpperCase()}</p>
              <h2 style={{ fontSize: 18, margin: "12px 0 8px" }}>{area.title}</h2>
              <p style={{ fontSize: 14, color: "#667085", lineHeight: 1.6, margin: 0 }}>{area.description}</p>
            </article>
          ))}
        </section>
        <aside style={{ marginTop: 24, padding: 20, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 14, color: "#9a3412", lineHeight: 1.6 }}>
          <strong>Preview only:</strong> No administrative controls are active yet. Do not enter credentials here. Owner authentication and permission enforcement will be implemented before this workspace is enabled.
        </aside>
      </div>
    </main>
  );
}
