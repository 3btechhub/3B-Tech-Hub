import Link from "next/link";

export const metadata = { title: "Gallery | 3B TECH HUB", description: "Photos and media from 3B TECH HUB." };

export default function GalleryPage() {
  return (
    <main style={{ minHeight: "70vh", padding: "64px 20px", background: "var(--background)" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <p className="eyebrow">3B TECH HUB</p>
        <h1 style={{ fontSize: 38 }}>Gallery</h1>
        <p className="muted" style={{ lineHeight: 1.7 }}>Published photos and videos will appear here when the public gallery is enabled.</p>
        <Link href="/" className="button">Back to Home</Link>
      </section>
    </main>
  );
}
