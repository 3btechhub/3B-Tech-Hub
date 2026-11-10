import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { appendAuditEvent, isAuditStoreConfigured } from "@/lib/audit-store";
import {
  createAppwriteRow,
  deleteAppwriteRow,
  getAppwriteRow,
  isSettingsStoreConfigured,
  updateAppwriteRow,
} from "@/lib/appwrite-server";
import { proposedSiteSettings, siteSettingsSchema } from "@/lib/settings-schema";

export const runtime = "nodejs";

const rowId = "global";

export async function GET(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isSettingsStoreConfigured()) {
    return NextResponse.json({ error: "Site settings storage is not configured." }, { status: 503 });
  }

  try {
    const row = await getAppwriteRow(process.env.APPWRITE_SETTINGS_TABLE_ID!, rowId);
    const raw = typeof row.settings === "string" ? JSON.parse(row.settings) : null;
    const parsed = siteSettingsSchema.safeParse(raw);
    return NextResponse.json({ settings: parsed.success ? parsed.data : proposedSiteSettings, saved: parsed.success });
  } catch {
    return NextResponse.json({ settings: proposedSiteSettings, saved: false });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isSettingsStoreConfigured() || !isAuditStoreConfigured()) {
    return NextResponse.json({ error: "Settings and audit storage must both be configured." }, { status: 503 });
  }

  const parsed = siteSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid site settings.", issues: parsed.error.issues }, { status: 400 });
  }

  const tableId = process.env.APPWRITE_SETTINGS_TABLE_ID!;
  const data = {
    settings: JSON.stringify(parsed.data),
    updatedBy: auth.identity!.id,
    updatedAt: new Date().toISOString(),
  };

  let previous: Record<string, unknown> | null = null;
  try {
    const existing = await getAppwriteRow(tableId, rowId);
    previous = {
      settings: existing.settings,
      updatedBy: existing.updatedBy,
      updatedAt: existing.updatedAt,
    };
  } catch {
    previous = null;
  }

  let created = false;
  try {
    if (previous) {
      await updateAppwriteRow(tableId, rowId, data);
    } else {
      await createAppwriteRow(tableId, rowId, data);
      created = true;
    }

    try {
      await appendAuditEvent({
        actorId: auth.identity!.id,
        actorRole: "owner",
        action: "settings.update",
        targetType: "settings",
        targetId: rowId,
        outcome: "success",
        metadata: { fields: Object.keys(parsed.data).join(",") },
        occurredAt: data.updatedAt,
      });
    } catch {
      if (created) await deleteAppwriteRow(tableId, rowId).catch(() => undefined);
      else if (previous) await updateAppwriteRow(tableId, rowId, previous).catch(() => undefined);
      return NextResponse.json({ error: "Audit recording failed; settings were rolled back where possible." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, saved: true, updatedAt: data.updatedAt });
  } catch {
    return NextResponse.json({ error: "Site settings could not be saved." }, { status: 502 });
  }
}
