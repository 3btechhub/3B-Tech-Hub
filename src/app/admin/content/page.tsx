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
          <p>Create drafts, preview revisions and manage the Owner approval and publishing workflow.</p>
        </header>
        <ContentEditor />
        <RevisionBrowser />
        <aside className="approval-note"><strong>Owner-controlled publishing</strong><span>Draft saving, review submission, approval and publishing use protected Appwrite endpoints. Each successful change is written to the audit log. Only the configured Owner can perform these actions.</span></aside>
      </div>
    </main>
  );
}
