import Link from "next/link";
import { ContentEditor } from "./content-editor";
import { RevisionBrowser } from "./revision-browser";

export const metadata = {
  title: "Content Management",
  robots: { index: false, follow: false },
};

export default function ContentManagementPage() {
  return (
    <main className="content-admin">
      <div className="content-shell">
        <Link href="/admin" className="back-link">← Admin workspace</Link>
        <header className="content-header">
          <div><span className="content-eyebrow">WEBSITE CONTROL CENTER</span><h1>Content management</h1></div>
          <p>Shape your website content, check the preview and validate changes before they enter the approval process.</p>
        </header>
        <ContentEditor />
        <RevisionBrowser />
        <aside className="approval-note"><strong>Owner-controlled publishing</strong><span>Saving, review submission and publishing are not connected yet. No changes leave this browser. Production publishing will remain restricted to the Owner.</span></aside>
      </div>
      <style>{`
        .content-admin{min-height:100vh;background:#f4f6f9;padding:34px 20px 60px;color:#172033}
        .content-shell{max-width:1180px;margin:0 auto}.back-link{color:#155eef;text-decoration:none;font-weight:700;font-size:14px}
        .content-header{display:flex;justify-content:space-between;align-items:end;gap:24px;margin:28px 0}.content-header h1{font-size:clamp(30px,4vw,42px);letter-spacing:-.045em;margin:7px 0}.content-header p{max-width:440px;color:#667085;line-height:1.7;margin:0 0 5px}.content-eyebrow,.editor-kicker{font-size:11px;letter-spacing:.13em;font-weight:800;color:#667085}
        .editor-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:start}.editor-panel,.preview-panel{background:#fff;border:1px solid #e4e7ec;border-radius:18px;padding:22px;box-shadow:0 4px 16px #10182808}
        .editor-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.editor-heading h2{font-size:22px;margin:5px 0}.draft-pill{font-size:12px;background:#fff7e6;color:#9a6700;border-radius:30px;padding:7px 10px;font-weight:700}
        .editor-panel label{display:grid;gap:7px;margin:14px 0;font-size:13px;font-weight:700;color:#344054}.editor-panel input,.editor-panel textarea{width:100%;border:1px solid #d0d5dd;border-radius:9px;padding:11px 12px;font:inherit;font-size:14px;color:#101828;background:#fff;outline-offset:2px}.editor-panel input:focus,.editor-panel textarea:focus{border-color:#6172f3}
        .section-summary,.seo-fields{border:1px solid #eaecf0;border-radius:12px;padding:14px;margin-top:18px;display:grid;gap:8px}.section-summary span,.section-summary small{color:#667085;font-size:13px}.section-summary small{line-height:1.5}.seo-fields>strong{font-size:14px}.seo-fields label{margin:4px 0}
        .editor-actions{display:flex;gap:10px;margin-top:18px}.editor-actions button{border:0;border-radius:9px;background:#155eef;color:#fff;padding:10px 14px;font-weight:700;cursor:pointer}.editor-actions button:disabled{opacity:.5;cursor:not-allowed}.editor-actions .secondary-action{background:#eef2f6;color:#344054}
        .editor-notice,.validation-error,.validation-success{font-size:12px;line-height:1.5;margin:12px 0 0;color:#667085}.validation-error{color:#b42318}.validation-success{color:#067647}
        .preview-panel{padding:14px}.preview-top{display:flex;justify-content:space-between;padding:7px 7px 14px;color:#667085;font-size:10px;font-weight:800;letter-spacing:.1em}.preview-site{border:1px solid #eaecf0;border-radius:12px;overflow:hidden;min-height:520px;background:#fff}.preview-nav{display:flex;justify-content:space-between;gap:10px;padding:17px 16px;border-bottom:1px solid #eaecf0;font-size:11px}.preview-nav strong{letter-spacing:.08em}.preview-nav span{color:#667085}.preview-hero{padding:58px 28px;background:linear-gradient(135deg,#101828,#1d3557);color:white}.preview-eyebrow{font-size:9px;letter-spacing:.14em;color:#b9c8e6}.preview-hero h2{font-size:clamp(27px,3vw,38px);line-height:1.1;letter-spacing:-.04em;margin:17px 0 12px;max-width:420px}.preview-hero p{font-size:13px;color:#d0d5dd;line-height:1.7;max-width:390px}.preview-cta{display:inline-block;margin-top:14px;padding:10px 14px;border-radius:8px;background:#fff;color:#101828;font-size:11px;font-weight:800}.preview-services{padding:30px 22px}.preview-services small{font-size:9px;letter-spacing:.13em;color:#667085}.preview-services h3{font-size:22px;margin:8px 0 17px}.preview-services>div{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.preview-services>div span{padding:14px 8px;background:#f2f4f7;border-radius:8px;font-size:10px;text-align:center;font-weight:700}.preview-caption{font-size:11px;color:#667085;line-height:1.5;padding:0 7px;margin:12px 0 2px}
        .approval-note{display:grid;gap:5px;margin-top:18px;padding:16px 18px;background:#fffaeb;border:1px solid #fedf89;border-radius:12px;color:#7a4d00;font-size:13px;line-height:1.6}.approval-note strong{font-size:14px}
        @media(max-width:800px){.content-header{display:block}.content-header p{margin-top:10px}.editor-grid{grid-template-columns:1fr}.preview-panel{order:2}}@media(max-width:420px){.content-admin{padding:22px 12px 42px}.editor-panel{padding:16px}.preview-hero{padding:42px 20px}.preview-services>div{grid-template-columns:1fr}.preview-nav span{font-size:9px}}
      `}</style>
    </main>
  );
}
