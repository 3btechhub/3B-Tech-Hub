import { NextRequest, NextResponse } from "next/server";
import { pageRevisionSchema } from "@/lib/content-schema";
import { isContentStoreConfigured, listAppwriteRows } from "@/lib/appwrite-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await context.params;
  if (locale !== "en" && locale !== "bn") return NextResponse.json({ error: "Page not found." }, { status: 404 });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !isContentStoreConfigured()) {
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  }

  try {
    const result = await listAppwriteRows(process.env.APPWRITE_CONTENT_TABLE_ID!, 100);
    const candidates = (result.rows ?? [])
      .filter((row) => row.status === "published" && row.slug === slug && row.locale === locale)
      .sort((a, b) => Number(b.revision ?? 0) - Number(a.revision ?? 0));

    for (const row of candidates) {
      if (typeof row.payload !== "string") continue;
      let payload: unknown;
      try { payload = JSON.parse(row.payload); } catch { continue; }
      const parsed = pageRevisionSchema.safeParse(payload);
      if (parsed.success && parsed.data.status === "published" && parsed.data.slug === slug && parsed.data.locale === locale) {
        return NextResponse.json({ page: parsed.data }, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
      }
    }
    return NextResponse.json({ error: "Page not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Published page is temporarily unavailable." }, { status: 503 });
  }
}
