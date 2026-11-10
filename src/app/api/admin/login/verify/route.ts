import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({
  userId: z.string().min(1).max(36),
  secret: z.string().min(1).max(128),
});
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const cookieName = () => projectId ? `a_session_${projectId}` : "";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!endpoint || !projectId) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  const allowedIds = (process.env.ADMIN_OWNER_USER_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  if (!parsed.success || !allowedIds.includes(parsed.data.userId)) {
    return NextResponse.json({ error: "Invalid Owner sign-in request." }, { status: 403 });
  }

  try {
    const response = await fetch(`${endpoint}/account/sessions/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Appwrite-Project": projectId },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "The code is invalid or expired. Request a new code and try again." }, { status: 401 });
    }
    const session = await response.json() as { secret?: string; userId?: string };
    if (!session.secret || session.userId !== parsed.data.userId) {
      return NextResponse.json({ error: "Owner verification failed." }, { status: 403 });
    }
    const result = NextResponse.json({ ok: true });
    result.cookies.set(cookieName(), session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return result;
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 502 });
  }
}
