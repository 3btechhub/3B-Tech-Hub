import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export type SessionIdentity = { id: string; email: string };

function configuredOwnerIds() {
  return [
    ...(process.env.ADMIN_OWNER_USER_IDS ?? "").split(","),
    process.env.ADMIN_OWNER_USER_ID ?? "",
  ].map((id) => id.trim()).filter(Boolean);
}

export function sessionCookieName() {
  if (!projectId) throw new Error("Appwrite project is not configured");
  return `a_session_${projectId}`;
}

export async function getCurrentIdentity(): Promise<SessionIdentity | null> {
  if (!endpoint || !projectId) return null;
  const cookieStore = await cookies();
  const secret = cookieStore.get(sessionCookieName())?.value;
  if (!secret) return null;
  try {
    const response = await fetch(`${endpoint}/account`, {
      headers: { "X-Appwrite-Project": projectId, Cookie: `${sessionCookieName()}=${secret}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const account = (await response.json()) as { $id?: string; email?: string };
    if (!account.$id || !account.email) return null;
    return { id: account.$id, email: account.email };
  } catch {
    return null;
  }
}

export async function isOwnerIdentity(identity: SessionIdentity | null) {
  if (!identity) return false;
  return configuredOwnerIds().includes(identity.id);
}

export async function getAdminIdentity(): Promise<SessionIdentity | null> {
  const identity = await getCurrentIdentity();
  return await isOwnerIdentity(identity) ? identity : null;
}

export async function requireIdentity() {
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/login?next=%2Fprofile");
  return identity;
}

export async function requireAdmin() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/login?next=%2Fadmin");
  return identity;
}
