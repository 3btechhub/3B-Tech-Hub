"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Revision = {
  $id: string;
  slug?: string;
  locale?: string;
  revision?: number;
  status?: string;
  createdAt?: string;
};

export function RevisionBrowser() {
  const [items, setItems] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/content/drafts", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Saved revisions could not be loaded.");
      setItems(Array.isArray(body.items) ? body.items : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Saved revisions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <section className="revision-browser" aria-labelledby="revision-browser-title">
      <div className="revision-browser-heading">
        <div>
          <span className="content-eyebrow">SAVED CONTENT</span>
          <h2 id="revision-browser-title">Revision history</h2>
          <p>Review saved drafts and open their private previews before submitting them for approval.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading}>Refresh</button>
      </div>
      {loading ? <p className="revision-state">Loading saved revisions…</p> : null}
      {error ? <p className="revision-error" role="alert">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="revision-state">No saved revisions found. Save a draft above to start the revision history.</p>
      ) : null}
      {!loading && !error && items.length > 0 ? (
        <div className="revision-list">
          {items.map((item) => (
            <article className="revision-item" key={item.$id}>
              <div className="revision-main">
                <strong>{item.slug || "Untitled page"}</strong>
                <span>Revision {item.revision ?? "—"} · {(item.locale || "—").toUpperCase()}</span>
              </div>
              <div className="revision-meta">
                <span className="revision-status">{item.status || "unknown"}</span>
                <Link href={`/admin/content/preview/${encodeURIComponent(item.$id)}`}>Open preview ↗</Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      <style>{`
        .revision-browser{margin-top:20px;padding:22px;background:#fff;border:1px solid #e4e7ec;border-radius:18px;box-shadow:0 4px 16px #10182808}
        .revision-browser-heading{display:flex;justify-content:space-between;align-items:start;gap:18px}
        .revision-browser-heading h2{font-size:22px;margin:5px 0}.revision-browser-heading p{font-size:13px;line-height:1.6;color:#667085;margin:0;max-width:560px}
        .revision-browser-heading button{border:1px solid #d0d5dd;background:#fff;border-radius:8px;padding:8px 12px;font-weight:700;color:#344054;cursor:pointer}.revision-browser-heading button:disabled{opacity:.5;cursor:wait}
        .revision-state,.revision-error{font-size:13px;color:#667085;padding:14px 0;margin:0}.revision-error{color:#b42318}
        .revision-list{display:grid;gap:9px;margin-top:16px}.revision-item{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px;border:1px solid #eaecf0;border-radius:10px}
        .revision-main,.revision-meta{display:flex;align-items:center;gap:12px}.revision-main{min-width:0;flex-wrap:wrap}.revision-main strong{font-size:14px;color:#101828}.revision-main span{font-size:12px;color:#667085}
        .revision-meta{flex-shrink:0}.revision-status{font-size:11px;font-weight:700;text-transform:capitalize;padding:5px 8px;border-radius:20px;background:#f2f4f7;color:#344054}
        .revision-meta a{font-size:12px;font-weight:700;color:#155eef;text-decoration:none;white-space:nowrap}
        @media(max-width:560px){.revision-browser{padding:16px}.revision-browser-heading{display:block}.revision-browser-heading button{margin-top:12px}.revision-item{align-items:flex-start;flex-direction:column}.revision-meta{width:100%;justify-content:space-between}}
      `}</style>
    </section>
  );
}
