import { createSupabaseServerClient } from "@/lib/supabase/server";
import { proposedSiteSettings, siteSettingsSchema } from "@/lib/settings-schema";

export async function getPublicSiteSettings() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "global")
      .eq("is_public", true)
      .maybeSingle();
    if (error || !data) return proposedSiteSettings;
    const parsed = siteSettingsSchema.safeParse(data.setting_value);
    return parsed.success ? parsed.data : proposedSiteSettings;
  } catch {
    return proposedSiteSettings;
  }
}
