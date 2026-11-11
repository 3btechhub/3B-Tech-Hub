import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({
  userId: z.string().min(1).max(36),
  secret: z.string().min(1).max(256),
  password: z.string().min(12).max(256),
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const ownerId = process.env.ADMIN_OWNER_USER_ID?.trim();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!endpoint || !projectId || !ownerId) {
    return NextResponse.json({ error: "Password recovery is not configured." }, { status: 503 });
  }
  if (!parsed.success || parsed.data.userId !== ownerId) {
    return NextResponse.json({ error: "Invalid Owner password reset request." }, { status: 403 });
  }
  try {
    const response = await fetch(endpoint + "/account/recovery", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Appwrite-Project": projectId },
      body: JSON.stringify({ userId: ownerId, secret: parsed.data.secret, password: parsed.data.password, passwordAgain: parsed.data.password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "The reset link is invalid or expired. Request a new one." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 502 });
  }
}
