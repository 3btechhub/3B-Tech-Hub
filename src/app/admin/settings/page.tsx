import Link from "next/link";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <main className="settings-admin">
      <div className="settings-shell">
        <Link href="/admin" className="settings-back">← Admin workspace</Link>
        <h1 className="settings-title">Full website settings</h1>
        <p className="settings-intro">
          Change brand content, colors, languages, currencies, contact details, SEO, announcements, navigation and services. Changes are saved to the production Appwrite settings table.
        </p>
        <SettingsForm />
      </div>
    </main>
  );
}
