import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-session";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const owner = await requireAdmin();

  return (
    <>
      <div className="admin-session-bar" style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "10px 20px", background: "#101828", color: "white", fontSize: 13 }}>
        <span>Signed in: {owner.email}</span>
        <form action="/api/admin/logout" method="post">
          <button type="submit" style={{ background: "transparent", border: "1px solid #98a2b3", color: "white", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>Sign out</button>
        </form>
      </div>
      {children}
    </>
  );
}
