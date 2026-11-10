import Link from "next/link";
import { MediaLibrary } from "./media-library";

export const metadata = {
  title: "Media Library",
  robots: { index: false, follow: false },
};

export default function AdminMediaPage() {
  return (
    <main className="media-admin">
      <div className="media-shell">
        <Link href="/admin" className="media-back">← Admin workspace</Link>
        <header className="media-header">
          <div><span>3B TECH HUB · CONTENT TOOLS</span><h1>Media Library</h1></div>
          <p>Upload optimized assets or register externally hosted media. Manage metadata and safely move unused items to trash.</p>
        </header>
        <MediaLibrary />
      </div>
      <style>{`
        .media-admin{min-height:100vh;background:#f4f6f9;padding:34px 20px 60px;color:#172033}.media-shell{max-width:1100px;margin:0 auto}.media-back{color:#155eef;text-decoration:none;font-weight:700;font-size:14px}.media-header{display:flex;justify-content:space-between;align-items:end;gap:24px;margin:28px 0}.media-header span{font-size:11px;letter-spacing:.13em;color:#667085;font-weight:800}.media-header h1{font-size:clamp(30px,4vw,42px);letter-spacing:-.045em;margin:7px 0}.media-header p{max-width:450px;color:#667085;line-height:1.7;margin:0 0 5px}.media-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px}.media-panel,.media-item{background:#fff;border:1px solid #e4e7ec;border-radius:15px;padding:18px}.media-panel h2{font-size:17px;margin:0 0 14px}.media-panel label,.media-item label{display:grid;gap:6px;margin:10px 0;font-size:12px;font-weight:700;color:#344054}.media-panel input,.media-item input,.media-panel select{width:100%;padding:10px;border:1px solid #d0d5dd;border-radius:8px;font:inherit;font-size:13px;background:white}.media-action{border:0;border-radius:8px;background:#155eef;color:white;padding:10px 13px;font-weight:700;cursor:pointer}.media-action:disabled{opacity:.5}.media-secondary{border:1px solid #d0d5dd;background:white;color:#344054;border-radius:8px;padding:9px 12px;font-weight:700;cursor:pointer}.media-list{margin-top:22px}.media-list-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}.media-list-head h2{font-size:20px}.media-item h3{font-size:15px;margin:0 0 6px;overflow-wrap:anywhere}.media-item p{font-size:12px;color:#667085;overflow-wrap:anywhere}.media-item-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.media-notice{margin:12px 0;padding:12px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:9px;color:#164a7b;font-size:13px;line-height:1.5}.media-warning{margin-top:18px;padding:14px 16px;background:#fffaeb;border:1px solid #fedf89;border-radius:10px;color:#7a4d00;font-size:13px;line-height:1.6}@media(max-width:760px){.media-header{display:block}.media-header p{margin-top:10px}}@media(max-width:420px){.media-admin{padding:22px 12px 42px}}
      `}</style>
    </main>
  );
}
