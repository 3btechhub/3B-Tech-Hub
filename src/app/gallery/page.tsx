import Link from "next/link";

export const metadata = { title: "Gallery | 3B TECH HUB", description: "Photos and media from 3B TECH HUB." };

export default function GalleryPage() {
  return (
    <main className="gallery-page container">
      <section className="gallery-shell">
        <p className="eyebrow">3B TECH HUB</p>
        <h1>Gallery</h1>
        <p className="muted gallery-description">Published photos and videos will appear here when the public gallery is enabled.</p>
        <Link href="/" className="button">Back to Home</Link>
      </section>
    </main>
  );
}
