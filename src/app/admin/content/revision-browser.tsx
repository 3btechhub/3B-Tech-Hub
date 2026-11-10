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
                <span>Revision {item.revision ?? "—"} · {(item.locale || "—").toUpperCase()}</span><code title="Revision ID">{item.$id}</code>
              </div>
              <div className="revision-meta">
                <span className="revision-status">{item.status || "unknown"}</span>
                <Link href={`/admin/content/preview/${encodeURIComponent(item.$id)}`}>Open preview ↗</Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      
    </section>
  );
}
