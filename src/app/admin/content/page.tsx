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
      
    </main>
  );
}
