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

type WorkflowAction = "submit_for_review" | "approve" | "publish";

const nextAction: Record<string, { action: WorkflowAction; label: string }> = {
  draft: { action: "submit_for_review", label: "Submit for review" },
  in_review: { action: "approve", label: "Approve" },
  approved: { action: "publish", label: "Publish" },
};

export function RevisionBrowser() {
  const [items, setItems] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
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

  async function transition(item: Revision, action: WorkflowAction) {
    setWorkingId(item.$id);
    setError("");
    try {
      const response = await fetch(`/api/admin/content/drafts/${encodeURIComponent(item.$id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Content workflow action failed.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Content workflow action failed.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <section className="revision-browser" aria-labelledby="revision-browser-title">
      <div className="revision-browser-heading">
        <div>
          <span className="content-eyebrow">SAVED CONTENT</span>
          <h2 id="revision-browser-title">Revision history</h2>
          <p>Open protected previews and move content through the Owner approval workflow.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading || Boolean(workingId)}>Refresh</button>
      </div>
      {loading ? <p className="revision-state">Loading saved revisions…</p> : null}
      {error ? <p className="revision-error" role="alert">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="revision-state">No saved revisions found. Save a draft above to start the revision history.</p>
      ) : null}
      {!loading && items.length > 0 ? (
        <div className="revision-list">
          {items.map((item) => {
            const action = item.status ? nextAction[item.status] : undefined;
            return (
              <article className="revision-item" key={item.$id}>
                <div className="revision-main">
                  <strong>{item.slug || "Untitled page"}</strong>
                  <span>Revision {item.revision ?? "—"} · {(item.locale || "—").toUpperCase()}</span>
                  <code title="Revision ID">{item.$id}</code>
                </div>
                <div className="revision-meta">
                  <span className="revision-status">{item.status || "unknown"}</span>
                  <Link href={`/admin/content/preview/${encodeURIComponent(item.$id)}`}>Open preview ↗</Link>
                  {action && (
                    <button
                      type="button"
                      className="secondary-action"
                      disabled={loading || Boolean(workingId)}
                      onClick={() => void transition(item, action.action)}
                    >
                      {workingId === item.$id ? "Saving…" : action.label}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
