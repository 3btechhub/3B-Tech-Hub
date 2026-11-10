import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";

export const metadata = { title: "Profile | 3B TECH HUB", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const owner = await requireAdmin();
  return (
    <main style={{ minHeight: "100vh", padding: "48px 20px", background: "var(--background)" }}>
      <section style={{ maxWidth: 680, margin: "0 auto", padding: 28, border: "1px solid var(--border)", borderRadius: 18, background: "var(--surface)" }}>
        <p style={{ color: "var(--brand)", fontWeight: 800, letterSpacing: ".1em", fontSize: 12 }}>3B TECH HUB · PROFILE</p>
        <h1 style={{ fontSize: 30, margin: "10px 0" }}>Owner Profile</h1>
        <p style={{ color: "var(--muted)" }}>Signed-in account</p>
        <p><strong>Email:</strong> {owner.email}</p>
        <p><strong>Access:</strong> Owner / Administrator</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
          <Link href="/admin" className="button">Open Dashboard</Link>
          <Link href="/" className="button secondary">Back to website</Link>
        </div>
      </section>
    </main>
  );
}
