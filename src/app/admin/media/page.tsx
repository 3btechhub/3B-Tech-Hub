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
      
    </main>
  );
}
