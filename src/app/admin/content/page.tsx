const modules = [
  ["Pages", "Create, revise and preview public website pages."],
  ["Navigation", "Arrange menus, labels, visibility and destination links."],
  ["Homepage sections", "Manage hero text, service highlights and calls to action."],
  ["Media library", "Organize images, documents, alternative text and access."],
  ["SEO", "Edit page titles, descriptions, canonical URLs and social previews."],
];

export const metadata = {
  title: "Content Management",
  robots: { index: false, follow: false },
};

export default function ContentManagementPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f9", padding: "36px 20px" }}>
      <div style={{ width: "min(900px,100%)", margin: "0 auto" }}>
        <a href="/admin" style={{ color: "#0b5cab", fontWeight: 700 }}>← Admin workspace</a>
        <h1 style={{ fontSize: 34, letterSpacing: "-.04em", margin: "26px 0 8px" }}>Content management</h1>
        <p style={{ color: "#667085", lineHeight: 1.7 }}>The content editor will use draft revisions and protected previews. Publishing remains owner-only.</p>
        <section style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {modules.map(([title, description]) => (
            <article key={title} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 19 }}>{title}</h2>
              <p style={{ margin: 0, color: "#667085", lineHeight: 1.6 }}>{description}</p>
            </article>
          ))}
        </section>
        <aside style={{ marginTop: 22, padding: 18, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, color: "#164a7b", lineHeight: 1.6 }}>
          No content changes can be saved or published from this preview yet. Authentication, server-side permission checks, version storage and audit events must be connected first.
        </aside>
      </div>
    </main>
  );
}
