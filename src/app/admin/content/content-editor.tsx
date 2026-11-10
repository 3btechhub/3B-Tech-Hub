"use client";

import { useMemo, useState } from "react";
import { pageRevisionSchema } from "@/lib/content-schema";

const initialDraft = {
  slug: "home",
  locale: "en" as const,
  title: "Home",
  status: "draft" as const,
  sections: [
    { type: "hero" as const, heading: "Technology solutions you can trust", subheading: "Repair, support and practical technology services from 3B TECH HUB." },
    { type: "service_grid" as const, heading: "Our services", serviceIds: ["phone-repair", "tv-repair", "satellite-support"] },
    { type: "cta" as const, heading: "Need technical help?", body: "Tell us what you need and our team will help.", actionLabel: "Contact us", actionHref: "/#contact" },
  ],
  seo: { title: "3B TECH HUB | Technology Services", description: "Electronics repair and technology support." },
  revision: 1,
};

export function ContentEditor() {
  const [draft, setDraft] = useState(initialDraft);
  const [notice, setNotice] = useState("Local draft only — no data has been sent or saved.");
  const validation = useMemo(() => pageRevisionSchema.safeParse(draft), [draft]);
  const hero = draft.sections.find((section) => section.type === "hero");
  const cta = draft.sections.find((section) => section.type === "cta");

  function updateHero(field: "heading" | "subheading", value: string) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.type === "hero" ? { ...section, [field]: value } : section,
      ),
    }));
    setNotice("Unsaved local changes. Persistent saving is not enabled yet.");
  }

  function updateSeo(field: "title" | "description", value: string) {
    setDraft((current) => ({ ...current, seo: { ...current.seo, [field]: value } }));
    setNotice("Unsaved local changes. Persistent saving is not enabled yet.");
  }

  async function saveDraft() {\n    setNotice("Saving draft…");\n    try {\n      const response = await fetch("/api/admin/content/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });\n      const body = await response.json();\n      if (!response.ok) throw new Error(body.error ?? "Draft could not be saved.");\n      setNotice(`Draft saved successfully. Revision ID: ${body.revisionId}`);\n      setDraft((current) => ({ ...current, revision: current.revision + 1 }));\n    } catch (error) {\n      setNotice(error instanceof Error ? error.message : "Draft save failed.");\n    }\n  }\n\n  function resetDraft() {
    setDraft(initialDraft);
    setNotice("The local example has been reset.");
  }

  return (
    <div className="content-editor">
      <div className="editor-grid">
        <section className="editor-panel" aria-label="Page editor">
          <div className="editor-heading">
            <div><span className="editor-kicker">PAGE BUILDER</span><h2>Edit homepage</h2></div>
            <span className="draft-pill">Draft · v{draft.revision}</span>
          </div>
          <label>Page title<input value={draft.title} maxLength={120} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>URL slug<input value={draft.slug} maxLength={100} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} /></label>
          <label>Hero heading<input value={hero?.heading ?? ""} maxLength={120} onChange={(event) => updateHero("heading", event.target.value)} /></label>
          <label>Hero description<textarea value={hero?.subheading ?? ""} maxLength={300} rows={3} onChange={(event) => updateHero("subheading", event.target.value)} /></label>
          <div className="section-summary"><strong>Homepage sections</strong><span>Hero · Services · Contact CTA</span><small>Section ordering and additional block types will be enabled in the next editor iteration.</small></div>
          <div className="seo-fields"><strong>Search appearance</strong>
            <label>SEO title<input value={draft.seo.title} maxLength={70} onChange={(event) => updateSeo("title", event.target.value)} /></label>
            <label>SEO description<textarea value={draft.seo.description} maxLength={180} rows={2} onChange={(event) => updateSeo("description", event.target.value)} /></label>
          </div>
          <div className="editor-actions"><button type="button" className="secondary-action" onClick={resetDraft}>Reset example</button><button type="button" disabled={!validation.success} onClick={() => void saveDraft()}>Save draft</button></div>
          <p className="editor-notice" role="status">{notice}</p>
          {!validation.success && <p className="validation-error" role="alert">{validation.error.issues[0]?.message ?? "Please check the page fields."}</p>}
          {validation.success && <p className="validation-success">All current page fields pass validation.</p>}
        </section>
        <section className="preview-panel" aria-label="Live page preview">
          <div className="preview-top"><span>LIVE PREVIEW</span><span>Desktop · Draft</span></div>
          <div className="preview-site">
            <div className="preview-nav"><strong>3B TECH HUB</strong><span>Services　 About　 Contact</span></div>
            <div className="preview-hero"><span className="preview-eyebrow">THREE BROTHERS · TECHNOLOGY HUB</span><h2>{hero?.heading || "Your homepage headline"}</h2><p>{hero?.subheading || "Your homepage introduction will appear here."}</p><span className="preview-cta">{cta?.type === "cta" ? cta.actionLabel : "Contact us"} ↗</span></div>
            <div className="preview-services"><small>WHAT WE DO</small><h3>Technology services</h3><div><span>Phone repair</span><span>TV service</span><span>Satellite support</span></div></div>
          </div>
          <p className="preview-caption">Preview reflects local edits only. It is not published and is not visible to website visitors.</p>
        </section>
      </div>
    </div>
  );
}
