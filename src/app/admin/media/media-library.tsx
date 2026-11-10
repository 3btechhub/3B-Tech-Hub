"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";

type MediaItem = {
  $id: string;
  title?: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  visibility?: "public" | "private";
  sourceType?: "appwrite" | "external" | "video_embed";
  externalUrl?: string;
  mediaType?: string;
  mimeType?: string;
  fileSize?: number;
  deletedAt?: string | null;
};

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [includeTrash, setIncludeTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("Media actions require the Appwrite server configuration.");
  const [external, setExternal] = useState({ title: "", altText: "", externalUrl: "", mediaType: "image" as "image" | "video" | "document" });
  const [upload, setUpload] = useState({ title: "", altText: "", file: null as File | null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/media${includeTrash ? "?includeTrash=1" : ""}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not load media.");
      setItems(body.items ?? []);
      setNotice(`Loaded ${body.items?.length ?? 0} media records.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Media library unavailable.");
    } finally {
      setLoading(false);
    }
  }, [includeTrash]);

  useEffect(() => { void load(); }, [load]);

  async function registerExternal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Registering external media…");
    try {
      const response = await fetch("/api/admin/media/external", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...external, sourceType: "external" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Registration failed.");
      setExternal({ title: "", altText: "", externalUrl: "", mediaType: "image" });
      setNotice("External media registered.");
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Registration failed."); }
  }

  async function uploadFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!upload.file) { setNotice("Choose a file first."); return; }
    const form = new FormData();
    form.set("file", upload.file);
    form.set("title", upload.title);
    form.set("altText", upload.altText);
    setNotice("Uploading media…");
    try {
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Upload failed.");
      setUpload({ title: "", altText: "", file: null });
      setNotice("Media uploaded successfully.");
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Upload failed."); }
  }

  async function updateItem(item: MediaItem) {
    const response = await fetch(`/api/admin/media/${encodeURIComponent(item.$id)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, altText: item.altText ?? "", caption: item.caption ?? "", tags: item.tags ?? [] }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Update failed.");
    setNotice("Media metadata updated.");
  }

  async function trashItem(item: MediaItem) {
    const response = await fetch(`/api/admin/media/${encodeURIComponent(item.$id)}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Could not move media to trash.");
    setNotice("Media moved to trash.");
    await load();
  }

  async function restoreItem(item: MediaItem) {
    const response = await fetch(`/api/admin/media/${encodeURIComponent(item.$id)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore" }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Could not restore media.");
    setNotice("Media restored.");
    await load();
  }

  return (
    <div>
      <p className="media-notice" role="status">{notice}</p>
      <div className="media-grid">
        <section className="media-panel">
          <h2>Upload from device</h2>
          <form onSubmit={uploadFile}>
            <label>Asset title<input required maxLength={120} value={upload.title} onChange={(e) => setUpload((s) => ({ ...s, title: e.target.value }))} /></label>
            <label>Alternative text<input maxLength={250} value={upload.altText} onChange={(e) => setUpload((s) => ({ ...s, altText: e.target.value }))} /></label>
            <label>Image, video or PDF (max 50 MB)<input required type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime,application/pdf" onChange={(e) => setUpload((s) => ({ ...s, file: e.target.files?.[0] ?? null }))} /></label>
            <button className="media-action" type="submit">Upload media</button>
          </form>
        </section>
        <section className="media-panel">
          <h2>Register external media</h2>
          <form onSubmit={registerExternal}>
            <label>Asset title<input required maxLength={120} value={external.title} onChange={(e) => setExternal((s) => ({ ...s, title: e.target.value }))} /></label>
            <label>Alternative text<input maxLength={250} value={external.altText} onChange={(e) => setExternal((s) => ({ ...s, altText: e.target.value }))} /></label>
            <label>HTTPS media URL<input required type="url" placeholder="https://cdn.example.com/image.webp" value={external.externalUrl} onChange={(e) => setExternal((s) => ({ ...s, externalUrl: e.target.value }))} /></label>
            <label>Media type<select value={external.mediaType} onChange={(e) => setExternal((s) => ({ ...s, mediaType: e.target.value as "image" | "video" | "document" }))}><option value="image">Image</option><option value="video">Video</option><option value="document">Document</option></select></label>
            <button className="media-action" type="submit">Register URL</button>
          </form>
        </section>
      </div>
      <section className="media-list">
        <div className="media-list-head"><h2>Library assets</h2><button className="media-secondary" type="button" onClick={() => setIncludeTrash((value) => !value)}>{includeTrash ? "Hide trash" : "Show trash"}</button></div>
        {loading ? <p>Loading media…</p> : items.length === 0 ? <p>No media records found. Configure the Appwrite tables and bucket to enable the library.</p> : (
          <div className="media-grid">
            {items.map((item) => (
              <article className="media-item" key={item.$id}>
                <h3>{item.title || "Untitled media"}</h3>
                <p>{item.mediaType || "Media"} · {item.sourceType || "Unknown source"} · {item.mimeType || item.externalUrl || ""}</p>
                <label>Title<input value={item.title ?? ""} disabled={Boolean(item.deletedAt)} onChange={(e) => setItems((current) => current.map((entry) => entry.$id === item.$id ? { ...entry, title: e.target.value } : entry))} /></label>
                <label>Alt text<input value={item.altText ?? ""} disabled={Boolean(item.deletedAt)} onChange={(e) => setItems((current) => current.map((entry) => entry.$id === item.$id ? { ...entry, altText: e.target.value } : entry))} /></label>
                <div className="media-item-actions">
                  {item.deletedAt ? <button className="media-secondary" type="button" onClick={() => void restoreItem(item).catch((e) => setNotice(e.message))}>Restore</button> : <><button className="media-action" type="button" onClick={() => void updateItem(item).catch((e) => setNotice(e.message))}>Save metadata</button><button className="media-secondary" type="button" onClick={() => void trashItem(item).catch((e) => setNotice(e.message))}>Move to trash</button></>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <aside className="media-warning"><strong>Safe deletion:</strong> Items are moved to trash, not permanently erased. Permanent deletion is withheld until usage tracking can confirm that published pages do not depend on the asset.</aside>
    </div>
  );
}
