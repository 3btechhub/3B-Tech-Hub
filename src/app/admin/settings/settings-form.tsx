"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { SiteSettings } from "@/lib/settings-schema";
import { proposedSiteSettings } from "@/lib/settings-schema";

export function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>(proposedSiteSettings);
  const [navigationJson, setNavigationJson] = useState(JSON.stringify(proposedSiteSettings.navigationItems, null, 2));
  const [servicesJson, setServicesJson] = useState(JSON.stringify(proposedSiteSettings.services, null, 2));
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Loading saved settings…");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Settings could not be loaded.");
        if (!active) return;
        const next = body.settings as SiteSettings;
        setSettings(next);
        setNavigationJson(JSON.stringify(next.navigationItems, null, 2));
        setServicesJson(JSON.stringify(next.services, null, 2));
        setNotice(body.saved ? "Saved settings loaded from Appwrite." : "No saved settings yet. Edit the defaults and save when ready.");
      })
      .catch((error) => { if (active) setNotice(error instanceof Error ? error.message : "Settings unavailable."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("Saving settings…");
    try {
      const payload: SiteSettings = {
        ...settings,
        navigationItems: JSON.parse(navigationJson),
        services: JSON.parse(servicesJson),
      };
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Settings could not be saved.");
      setSettings(payload);
      setNotice("Settings saved to Appwrite. The public site reads the saved configuration.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed. Check navigation and service JSON.");
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle: CSSProperties = { display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "#344054" };
  const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: 11, border: "1px solid #d0d5dd", borderRadius: 8, font: "inherit", fontWeight: 400, background: "white" };
  const panelStyle: CSSProperties = { background: "white", border: "1px solid #e4e7ec", borderRadius: 14, padding: 20, display: "grid", gap: 14 };
  const textAreaStyle: CSSProperties = { ...inputStyle, minHeight: 180, fontFamily: "ui-monospace,monospace", fontSize: 12 };

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16, opacity: busy ? 0.65 : 1 }}>
      <p role="status" style={{ margin: 0, padding: 13, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 9, color: "#164a7b", fontSize: 13 }}>{notice}</p>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 19 }}>Brand & homepage</h2>
        <label style={fieldStyle}>Site name<input style={inputStyle} maxLength={80} value={settings.siteName} onChange={(e) => set("siteName", e.target.value)} /></label>
        <label style={fieldStyle}>Tagline<input style={inputStyle} maxLength={120} value={settings.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
        <label style={fieldStyle}>Site description<textarea style={textAreaStyle} maxLength={300} value={settings.description} onChange={(e) => set("description", e.target.value)} /></label>
        <label style={fieldStyle}>Hero title<input style={inputStyle} maxLength={120} value={settings.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></label>
        <label style={fieldStyle}>Hero subtitle<textarea style={textAreaStyle} maxLength={300} value={settings.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} /></label>
        <label style={fieldStyle}>Primary color<input style={{ ...inputStyle, height: 44, padding: 4 }} type="color" value={settings.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} /></label>
        <label style={fieldStyle}>Accent color<input style={{ ...inputStyle, height: 44, padding: 4 }} type="color" value={settings.accentColor} onChange={(e) => set("accentColor", e.target.value)} /></label>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 19 }}>Language & currency</h2>
        <label style={fieldStyle}>Default language<select style={inputStyle} value={settings.defaultLocale} onChange={(e) => set("defaultLocale", e.target.value as "en" | "bn")}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
        <label style={fieldStyle}>Enabled languages<select style={inputStyle} multiple value={settings.enabledLocales} onChange={(e) => set("enabledLocales", Array.from(e.target.selectedOptions, (o) => o.value as "en" | "bn"))}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
        <label style={fieldStyle}>Default currency<select style={inputStyle} value={settings.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value as "SAR" | "BDT")}><option value="SAR">SAR</option><option value="BDT">BDT</option></select></label>
        <label style={fieldStyle}>Enabled currencies<select style={inputStyle} multiple value={settings.enabledCurrencies} onChange={(e) => set("enabledCurrencies", Array.from(e.target.selectedOptions, (o) => o.value as "SAR" | "BDT"))}><option value="SAR">SAR</option><option value="BDT">BDT</option></select></label>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 19 }}>Contact details</h2>
        <label style={fieldStyle}>Public email<input style={inputStyle} type="email" value={settings.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></label>
        <label style={fieldStyle}>Phone number<input style={inputStyle} value={settings.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></label>
        <label style={fieldStyle}>WhatsApp HTTPS URL<input style={inputStyle} type="url" value={settings.whatsappUrl} onChange={(e) => set("whatsappUrl", e.target.value)} /></label>
        <label style={fieldStyle}>Business address<textarea style={textAreaStyle} value={settings.address} onChange={(e) => set("address", e.target.value)} /></label>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 19 }}>SEO & social preview</h2>
        <label style={fieldStyle}>SEO title<input style={inputStyle} maxLength={70} value={settings.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></label>
        <label style={fieldStyle}>SEO description<textarea style={textAreaStyle} maxLength={200} value={settings.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></label>
        <label style={fieldStyle}>Open Graph image HTTPS URL<input style={inputStyle} type="url" value={settings.ogImageUrl} onChange={(e) => set("ogImageUrl", e.target.value)} /></label>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 19 }}>Announcement banner</h2>
        <label style={{ display: "flex", gap: 9, alignItems: "center" }}><input type="checkbox" checked={settings.announcementEnabled} onChange={(e) => set("announcementEnabled", e.target.checked)} /> Enable announcement</label>
        <label style={fieldStyle}>Announcement text<input style={inputStyle} maxLength={180} value={settings.announcementText} onChange={(e) => set("announcementText", e.target.value)} /></label>
        <label style={fieldStyle}>Announcement link<input style={inputStyle} value={settings.announcementUrl} onChange={(e) => set("announcementUrl", e.target.value)} /></label>
        <label style={{ display: "flex", gap: 9, alignItems: "center" }}><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => set("maintenanceMode", e.target.checked)} /> Maintenance mode (public site shows maintenance notice)</label>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 19 }}>Navigation & service catalogue</h2>
        <label style={fieldStyle}>Navigation items (JSON)<textarea style={textAreaStyle} value={navigationJson} onChange={(e) => setNavigationJson(e.target.value)} /></label>
        <label style={fieldStyle}>Services (JSON)<textarea style={textAreaStyle} value={servicesJson} onChange={(e) => setServicesJson(e.target.value)} /></label>
        <p style={{ margin: 0, color: "#667085", fontSize: 12, lineHeight: 1.5 }}>Navigation format: <code>[{"label":"Services","href":"#services"}]</code>. Services use id, title, description and enabled fields. Invalid JSON or values are rejected before saving.</p>
      </section>

      <button type="submit" disabled={busy || saving} style={{ padding: 14, border: 0, borderRadius: 10, background: "#0b5cab", color: "white", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>{saving ? "Saving…" : "Save all website settings"}</button>
    </form>
  );
}
