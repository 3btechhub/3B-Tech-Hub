import { getAppwriteRow, isSettingsStoreConfigured } from "@/lib/appwrite-server";
import { proposedSiteSettings, siteSettingsSchema } from "@/lib/settings-schema";

export async function getPublicSiteSettings() {
  if (!isSettingsStoreConfigured()) return proposedSiteSettings;
  try {
    const row = await getAppwriteRow(process.env.APPWRITE_SETTINGS_TABLE_ID!, "global");
    const raw = typeof row.settings === "string" ? JSON.parse(row.settings) : null;
    const parsed = siteSettingsSchema.safeParse(raw);
    return parsed.success ? parsed.data : proposedSiteSettings;
  } catch {
    return proposedSiteSettings;
  }
}
