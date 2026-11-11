import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({ email: z.string().email().max(254) });

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const ownerEmail = process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();
  const ownerId = process.env.ADMIN_OWNER_USER_ID?.trim();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!endpoint || !projectId || !ownerEmail || !ownerId) {
    return NextResponse.json({ error: "Password recovery is not configured." }, { status: 503 });
  }
  if (!parsed.success || parsed.data.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ ok: true });
  }
  try {
    const response = await fetch(endpoint + "/account/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Appwrite-Project": projectId },
      body: JSON.stringify({ email: ownerEmail, url: request.nextUrl.origin + "/login/recovery/confirm" }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Appwrite could not send the reset email. Check the project's email delivery settings." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 502 });
  }
}
