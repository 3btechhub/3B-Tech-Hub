"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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


  return (
    <form onSubmit={save} className={"settings-form" + (busy ? " is-loading" : "")}>
      <p role="status" className="settings-notice">{notice}</p>

      <section className="settings-panel">
        <h2>Brand & homepage</h2>
        <label className="settings-field">Site name<input className="settings-input" maxLength={80} value={settings.siteName} onChange={(e) => set("siteName", e.target.value)} /></label>
        <label className="settings-field">Tagline<input className="settings-input" maxLength={120} value={settings.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
        <label className="settings-field">Site description<textarea className="settings-input settings-textarea" maxLength={300} value={settings.description} onChange={(e) => set("description", e.target.value)} /></label>
        <label className="settings-field">Hero title<input className="settings-input" maxLength={120} value={settings.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></label>
        <label className="settings-field">Hero subtitle<textarea className="settings-input settings-textarea" maxLength={300} value={settings.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} /></label>
        <p className="settings-fixed-theme">Design colors are fixed to black, white and neutral gray for consistency.</p>
      </section>

      <section className="settings-panel">
        <h2>Language & currency</h2>
        <label className="settings-field">Default language<select className="settings-input" value={settings.defaultLocale} onChange={(e) => set("defaultLocale", e.target.value as "en" | "bn")}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
        <label className="settings-field">Enabled languages<select className="settings-input" multiple value={settings.enabledLocales} onChange={(e) => set("enabledLocales", Array.from(e.target.selectedOptions, (o) => o.value as "en" | "bn"))}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
        <label className="settings-field">Default currency<select className="settings-input" value={settings.defaultCurrency} onChange={(e) => set("defaultCurrency", e.target.value as "SAR" | "BDT")}><option value="SAR">SAR</option><option value="BDT">BDT</option></select></label>
        <label className="settings-field">Enabled currencies<select className="settings-input" multiple value={settings.enabledCurrencies} onChange={(e) => set("enabledCurrencies", Array.from(e.target.selectedOptions, (o) => o.value as "SAR" | "BDT"))}><option value="SAR">SAR</option><option value="BDT">BDT</option></select></label>
      </section>

      <section className="settings-panel">
        <h2>Contact details</h2>
        <label className="settings-field">Public email<input className="settings-input" type="email" value={settings.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></label>
        <label className="settings-field">Phone number<input className="settings-input" value={settings.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></label>
        <label className="settings-field">WhatsApp HTTPS URL<input className="settings-input" type="url" value={settings.whatsappUrl} onChange={(e) => set("whatsappUrl", e.target.value)} /></label>
        <label className="settings-field">Business address<textarea className="settings-input settings-textarea" value={settings.address} onChange={(e) => set("address", e.target.value)} /></label>
      </section>

      <section className="settings-panel">
        <h2>SEO & social preview</h2>
        <label className="settings-field">SEO title<input className="settings-input" maxLength={70} value={settings.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></label>
        <label className="settings-field">SEO description<textarea className="settings-input settings-textarea" maxLength={200} value={settings.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></label>
        <label className="settings-field">Open Graph image HTTPS URL<input className="settings-input" type="url" value={settings.ogImageUrl} onChange={(e) => set("ogImageUrl", e.target.value)} /></label>
      </section>

      <section className="settings-panel">
        <h2>Announcement banner</h2>
        <label className="settings-check"><input type="checkbox" checked={settings.announcementEnabled} onChange={(e) => set("announcementEnabled", e.target.checked)} /> Enable announcement</label>
        <label className="settings-field">Announcement text<input className="settings-input" maxLength={180} value={settings.announcementText} onChange={(e) => set("announcementText", e.target.value)} /></label>
        <label className="settings-field">Announcement link<input className="settings-input" value={settings.announcementUrl} onChange={(e) => set("announcementUrl", e.target.value)} /></label>
        <label className="settings-check"><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => set("maintenanceMode", e.target.checked)} /> Maintenance mode (public site shows maintenance notice)</label>
      </section>

      <section className="settings-panel">
        <h2>Navigation & service catalogue</h2>
        <label className="settings-field">Navigation items (JSON)<textarea className="settings-input settings-textarea" value={navigationJson} onChange={(e) => setNavigationJson(e.target.value)} /></label>
        <label className="settings-field">Services (JSON)<textarea className="settings-input settings-textarea" value={servicesJson} onChange={(e) => setServicesJson(e.target.value)} /></label>
        <p className="settings-help">Navigation entries require label and href. Service entries require id, title, description and enabled. Invalid JSON or values are rejected before saving.</p>
      </section>

      <button type="submit" disabled={busy || saving} className="settings-save">{saving ? "Saving…" : "Save all website settings"}</button>
    </form>
  );
}
