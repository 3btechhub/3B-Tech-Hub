import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const [{ error: databaseError }, { error: storageError }] = await Promise.all([
      supabase.from("site_content").select("id", { head: true, count: "exact" }),
      supabase.storage.from("site-media").list("", { limit: 1 }),
    ]);
    const checks = {
      database: databaseError ? "unavailable" : "connected",
      storage: storageError ? "unavailable" : "connected",
    };
    const healthy = Object.values(checks).every((value) => value === "connected");
    return NextResponse.json(
      { status: healthy ? "ok" : "degraded", checks },
      { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", checks: { configuration: "missing_or_invalid" } },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
