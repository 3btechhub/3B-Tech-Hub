import { NextResponse } from "next/server";
import { getCurrentIdentity, isOwnerIdentity } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getCurrentIdentity();
  const admin = await isOwnerIdentity(identity);
  const role = admin ? "admin" : identity ? "member" : "visitor";
  return NextResponse.json(
    { authenticated: Boolean(identity), role, isMember: role === "member", isAdmin: admin, profile: identity ? { email: identity.email } : null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
