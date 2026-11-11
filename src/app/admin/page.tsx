import Link from "next/link";

export const metadata = {
  title: "Admin Overview",
  robots: { index: false, follow: false },
};

const availableModules = [
  { title: "Website Content", description: "Create, edit and review website content.", href: "/admin/content" },
  { title: "Media", description: "Upload and manage website media assets.", href: "/admin/media" },
  { title: "Settings", description: "Manage website appearance and configuration.", href: "/admin/settings" },
];

export default function AdminWorkspacePage() {
  return (
    <main className="admin-workspace">
      <div className="admin-workspace-shell">
        <header className="admin-workspace-header">
          <p className="admin-workspace-eyebrow">3B TECH HUB · ADMIN</p>
          <h1>Overview</h1>
          <p className="admin-workspace-intro">
            Select a module from the single-row navigation above. Available tools are listed below.
          </p>
        </header>
        <section className="admin-area-grid" aria-label="Available modules">
          {availableModules.map((area) => (
            <Link href={area.href} key={area.title} className="admin-area-link">
              <article className="admin-area-card">
                <h2>{area.title}</h2>
                <p className="admin-area-description">{area.description}</p>
                <p className="admin-area-open">Open module →</p>
              </article>
            </Link>
          ))}
        </section>
        <aside className="admin-owner-note">
          <strong>Access control:</strong> This workspace is protected by server-side Owner authentication. Administrative data and access policies are managed through Supabase.
        </aside>
      </div>
    </main>
  );
}
