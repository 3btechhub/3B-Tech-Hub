import { proposedSiteSettings } from "@/lib/settings-schema";

export const metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

const settings = [
  { label: "Site name", value: proposedSiteSettings.siteName },
  { label: "Default language", value: "English (proposed)" },
  { label: "Additional language", value: "বাংলা (proposed)" },
  { label: "Default currency", value: "SAR (proposed)" },
  { label: "Additional currency", value: "BDT (proposed)" },
  { label: "Contact email", value: "Not configured" },
];

export default function AdminSettingsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f6f9", padding: "36px 20px" }}>
      <div style={{ width: "min(900px,100%)", margin: "0 auto" }}>
        <a href="/admin" style={{ color: "#0b5cab", fontWeight: 700 }}>← Admin workspace</a>
        <h1 style={{ fontSize: 34, letterSpacing: "-.04em", margin: "26px 0 8px" }}>Site settings</h1>
        <p style={{ color: "#667085", lineHeight: 1.7 }}>Proposed configuration prepared for owner review. These values are not saved to Appwrite and do not change the live website.</p>
        <section style={{ display: "grid", gap: 12, marginTop: 24 }}>
          {settings.map((item) => (
            <article key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
              <strong>{item.label}</strong><span style={{ color: "#475467" }}>{item.value}</span>
            </article>
          ))}
        </section>
        <aside style={{ marginTop: 22, padding: 18, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, color: "#9a3412", lineHeight: 1.6 }}>
          Owner confirmation required: English + Bengali and SAR + BDT are provisional defaults. Contact details and launch-market requirements are still unconfirmed.
        </aside>
      </div>
    </main>
  );
}
