import Link from "next/link";
import { requireIdentity, isOwnerIdentity } from "@/lib/admin-session";

export const metadata = { title: "Profile | 3B TECH HUB", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const identity = await requireIdentity();
  const admin = await isOwnerIdentity(identity);
  return (
    <main style={{ minHeight: "100vh", padding: "48px 20px", background: "var(--background)" }}>
      <section style={{ maxWidth: 680, margin: "0 auto", padding: 28, border: "1px solid var(--border)", borderRadius: 18, background: "var(--surface)" }}>
        <p style={{ color: "var(--brand)", fontWeight: 800, letterSpacing: ".1em", fontSize: 12 }}>3B TECH HUB · PROFILE</p>
        <h1 style={{ fontSize: 30, margin: "10px 0" }}>{admin ? "Admin Profile" : "Member Profile"}</h1>
        <p style={{ color: "var(--muted)" }}>Signed-in account</p>
        <p><strong>Email:</strong> {identity.email}</p>
        <p><strong>Access:</strong> {admin ? "Administrator" : "Member"}</p>
        {admin && <p><Link href="/admin" className="button">Open Dashboard</Link></p>}
        <form action="/api/admin/logout" method="post" style={{ marginTop: 24 }}><button className="button" type="submit">Log Out</button></form>
      </section>
    </main>
  );
}
