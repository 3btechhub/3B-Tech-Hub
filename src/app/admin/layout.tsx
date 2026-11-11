import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-session";
import AdminModuleNav from "./admin-module-nav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const owner = await requireAdmin();

  return (
    <>
      <div className="admin-session-bar">
        <span>Signed in: {owner.email}</span>
        <form action="/api/admin/logout" method="post">
          <button className="secondary" type="submit">Sign out</button>
        </form>
      </div>
      <AdminModuleNav />
      {children}
    </>
  );
}
