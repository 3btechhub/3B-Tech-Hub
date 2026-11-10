import { NextRequest, NextResponse } from "next/server";
import { getAdminIdentity } from "./admin-session";

export async function requireOwnerApi(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (request.method !== "GET" && (!origin || origin !== request.nextUrl.origin)) {
    return { identity: null, response: NextResponse.json({ error: "Invalid request origin." }, { status: 403 }) };
  }
  const identity = await getAdminIdentity();
  if (!identity) return { identity: null, response: NextResponse.json({ error: "Owner authentication required." }, { status: 401 }) };
  return { identity, response: null };
}
