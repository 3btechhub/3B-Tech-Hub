import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({ email: z.string().email().max(254) });
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

function configuredOwnerId() {
  return process.env.ADMIN_OWNER_USER_ID?.trim()
    || (process.env.ADMIN_OWNER_USER_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean)[0];
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!endpoint || !projectId) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  const ownerEmail = process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();
  const ownerId = configuredOwnerId();
  if (!parsed.success || !ownerEmail || !ownerId || parsed.data.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: "This email is not enabled for Owner sign-in." }, { status: 403 });
  }

  try {
    const response = await fetch(`${endpoint}/account/tokens/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Appwrite-Project": projectId },
      body: JSON.stringify({ userId: ownerId, email: ownerEmail, phrase: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Unable to send a sign-in code. Confirm the Owner email is registered and try again." }, { status: 502 });
    }
    const token = await response.json() as { userId?: string };
    if (token.userId !== ownerId) {
      return NextResponse.json({ error: "Owner account verification failed." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, userId: token.userId, message: "A one-time sign-in code has been sent to the Owner email." });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 502 });
  }
}
