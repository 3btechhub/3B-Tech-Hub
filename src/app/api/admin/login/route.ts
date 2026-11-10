import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
});

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

function cookieName() {
  return projectId ? `a_session_${projectId}` : "";
}

export async function POST(request: NextRequest) {
  if (!endpoint || !projectId) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  // Reject missing and cross-origin Origin headers to mitigate login CSRF.
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const response = await fetch(`${endpoint}/account/sessions/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Appwrite-Project": projectId },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Sign-in failed." }, { status: 401 });
    }

    const session = (await response.json()) as { secret?: string; userId?: string };
    if (!session.secret || !session.userId) {
      return NextResponse.json({ error: "Invalid authentication response." }, { status: 502 });
    }

    const allowedIds = (process.env.ADMIN_OWNER_USER_IDS ?? "")
      .split(",").map((id) => id.trim()).filter(Boolean);

    if (!allowedIds.includes(session.userId)) {
      await fetch(`${endpoint}/account/sessions/current`, {
        method: "DELETE",
        headers: {
          "X-Appwrite-Project": projectId,
          Cookie: `${cookieName()}=${session.secret}`,
        },
        cache: "no-store",
      }).catch(() => undefined);
      return NextResponse.json({ error: "This account is not authorized for owner access." }, { status: 403 });
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
