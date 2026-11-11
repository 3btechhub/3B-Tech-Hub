import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionIdentity = { id: string; email: string };

export async function getCurrentIdentity(): Promise<SessionIdentity | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    return { id: data.user.id, email: data.user.email };
  } catch {
    return null;
  }
}

export async function isOwnerIdentity(identity: SessionIdentity | null) {
  if (!identity) return false;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", identity.id).in("role", ["owner", "admin"]).limit(1);
    return !error && Boolean(data?.length);
  } catch {
    return false;
  }
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
