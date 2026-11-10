import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const name = projectId ? `a_session_${projectId}` : "";
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const secret = name ? request.cookies.get(name)?.value : undefined;
  if (endpoint && projectId && secret) {
    await fetch(`${endpoint}/account/sessions/current`, {
      method: "DELETE",
      headers: { "X-Appwrite-Project": projectId, Cookie: `${name}=${secret}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  if (name) response.cookies.set(name, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
