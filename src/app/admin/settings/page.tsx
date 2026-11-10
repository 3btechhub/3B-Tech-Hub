import Link from "next/link";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <main className="settings-admin" style={{ minHeight: "100vh", background: "#f4f6f9", padding: "36px 20px" }}>
      <div style={{ width: "min(900px,100%)", margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#0b5cab", fontWeight: 700 }}>← Admin workspace</Link>
        <h1 style={{ fontSize: 34, letterSpacing: "-.04em", margin: "26px 0 8px" }}>Full website settings</h1>
        <p style={{ color: "#667085", lineHeight: 1.7, marginBottom: 24 }}>
          Change brand content, colors, languages, currencies, contact details, SEO, announcements, navigation and services. Changes are saved to the production Appwrite settings table.
        </p>
        <SettingsForm />
      </div>
    </main>
  );
}
