import Link from "next/link";

export const metadata = {
  title: "Media Library",
  robots: { index: false, follow: false },
};

const capabilities = [
  ["Upload media", "Upload images, video and documents to managed Appwrite Storage."],
  ["External media URL", "Register secure HTTPS media hosted on another server or CDN."],
  ["Organize library", "Search, filter, tag and group assets by content type."],
  ["Edit metadata", "Manage title, alt text, caption, tags and public/private visibility."],
  ["Usage tracking", "See where an asset is used before replacing or deleting it."],
  ["Safe deletion", "Move unused assets to trash before owner-authorized permanent deletion."],
];

export default function AdminMediaPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f9", padding: "36px 20px" }}>
      <div style={{ width: "min(1040px, 100%)", margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#0b5cab", fontWeight: 700 }}>← Admin workspace</Link>
        <header style={{ margin: "26px 0" }}>
          <p style={{ color: "#0b5cab", fontWeight: 800, letterSpacing: ".12em", fontSize: 12 }}>3B TECH HUB · CONTENT TOOLS</p>
          <h1 style={{ fontSize: 36, letterSpacing: "-.04em", margin: "8px 0" }}>Media Library</h1>
          <p style={{ color: "#667085", lineHeight: 1.7, maxWidth: 720 }}>
            A central library for website images, videos, documents and external media links.
            The data rules and management workflow are being prepared.
          </p>
        </header>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
          {capabilities.map(([title, description]) => (
            <article key={title} style={{ padding: 20, borderRadius: 14, background: "white", border: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: 17, margin: "0 0 8px" }}>{title}</h2>
              <p style={{ fontSize: 14, color: "#667085", lineHeight: 1.6, margin: 0 }}>{description}</p>
            </article>
          ))}
        </section>
        <aside style={{ marginTop: 22, padding: 18, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, color: "#9a3412", lineHeight: 1.6 }}>
          <strong>Preview only:</strong> Upload, edit and delete actions are not enabled until authenticated server-side permissions,
          Appwrite Storage bucket rules and media metadata storage are implemented and tested. Do not upload production files here yet.
        </aside>
      </div>
    </main>
  );
}
