import { NextResponse } from "next/server";
import { getAdminIdentity } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await getAdminIdentity();
  return NextResponse.json(
    { authenticated: Boolean(owner), isAdmin: Boolean(owner), profile: owner ? { email: owner.email } : null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
