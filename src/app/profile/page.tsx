import Link from "next/link";
import { requireIdentity, isOwnerIdentity } from "@/lib/admin-session";

export const metadata = { title: "Profile | 3B TECH HUB", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const identity = await requireIdentity();
  const admin = await isOwnerIdentity(identity);
  return (
    <main className="profile-page container">
      <section className="profile-card">
        <p className="profile-eyebrow">3B TECH HUB · PROFILE</p>
        <h1>{admin ? "Admin Profile" : "Member Profile"}</h1>
        <p className="profile-description">Signed-in account</p>
        <p><strong>Email:</strong> {identity.email}</p>
        <p><strong>Access:</strong> {admin ? "Administrator" : "Member"}</p>
        {admin && <p><Link href="/admin" className="button">Open Dashboard</Link></p>}
        <form action="/api/admin/logout" method="post" className="profile-actions"><button className="button" type="submit">Log Out</button></form>
      </section>
    </main>
  );
}
