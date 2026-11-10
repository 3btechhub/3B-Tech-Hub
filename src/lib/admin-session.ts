import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export function sessionCookieName() {
  if (!projectId) throw new Error("Appwrite project is not configured");
  return `a_session_${projectId}`;
}

export async function getAdminIdentity(): Promise<{ id: string; email: string } | null> {
  if (!endpoint || !projectId) return null;

  const cookieStore = await cookies();
  const secret = cookieStore.get(sessionCookieName())?.value;
  if (!secret) return null;

  try {
    const response = await fetch(`${endpoint}/account`, {
      headers: {
        "X-Appwrite-Project": projectId,
        Cookie: `${sessionCookieName()}=${secret}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const account = (await response.json()) as { $id?: string; email?: string };
    if (!account.$id || !account.email) return null;

    // Owner access is closed unless an exact Appwrite user ID is explicitly configured.
    const allowedIds = (process.env.ADMIN_OWNER_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!allowedIds.includes(account.$id)) return null;
    return { id: account.$id, email: account.email };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/login?next=%2Fadmin");
  return identity;
}
