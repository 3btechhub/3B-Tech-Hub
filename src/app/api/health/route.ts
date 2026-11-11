import { NextResponse } from "next/server";
import {
  getAppwriteBucket,
  isContentStoreConfigured,
  isMediaStoreConfigured,
  isSettingsStoreConfigured,
  listAppwriteRows,
} from "@/lib/appwrite-server";
import { isAuditStoreConfigured } from "@/lib/audit-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = {
    content: isContentStoreConfigured(),
    media: isMediaStoreConfigured(),
    settings: isSettingsStoreConfigured(),
    audit: isAuditStoreConfigured(),
    mediaBucket: Boolean(process.env.APPWRITE_API_KEY && process.env.APPWRITE_MEDIA_BUCKET_ID),
    owner: (process.env.ADMIN_OWNER_USER_IDS ?? "").split(",").some((id) => id.trim().length > 0),
  };

  const checks = Object.fromEntries(
    await Promise.all(
      Object.entries(configured).map(async ([name, ready]) => {
        if (!ready) return [name, "not_configured"];
        if (name === "owner") return [name, "configured"];
        try {
          if (name === "mediaBucket") {
            const bucket = await getAppwriteBucket(process.env.APPWRITE_MEDIA_BUCKET_ID!);
            return [name, bucket.enabled === false ? "disabled" : "connected"];
          }
          const tableId = name === "content"
            ? process.env.APPWRITE_CONTENT_TABLE_ID!
            : name === "media"
              ? process.env.APPWRITE_MEDIA_TABLE_ID!
              : name === "settings"
                ? process.env.APPWRITE_SETTINGS_TABLE_ID!
                : process.env.APPWRITE_AUDIT_TABLE_ID!;
          await listAppwriteRows(tableId, 1, 0, undefined, false);
          return [name, "connected"];
        } catch {
          return [name, "unavailable"];
        }
      }),
    ),
  );

  const healthy = Object.values(checks).every((value) => value === "connected" || value === "configured");
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
