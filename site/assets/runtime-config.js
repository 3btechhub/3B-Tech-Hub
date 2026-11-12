const THEME_VARIABLES = Object.freeze({
  page_bg: "--page-bg",
  page_text: "--page-text",
  surface: "--surface",
  line: "--line",
  muted: "--muted",
  hover: "--hover",
  primary: "--primary"
});

const LAYOUT_VARIABLES = Object.freeze({
  content_max_width: "--content-max-width",
  header_min_height: "--header-min-height",
  footer_min_height: "--footer-min-height"
});

const COLOR_KEYS = new Set(Object.keys(THEME_VARIABLES));
const LENGTH_KEYS = new Set(Object.keys(LAYOUT_VARIABLES));

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isSafeRuntimeValue(key, value) {
  if (typeof value !== "string" || value.length > 160) return false;
  if (/[;{}<>\\]|url\\s*\\(|expression\\s*\\(|javascript:/i.test(value)) return false;

  if (COLOR_KEYS.has(key)) {
    return /^#[0-9a-f]{3,8}$/i.test(value)
      || /^(?:rgb|rgba|hsl|hsla)\\([0-9\\s.,%/]+\\)$/i.test(value);
  }

  if (LENGTH_KEYS.has(key)) {
    return /^(?:0|[0-9]+(?:\\.[0-9]+)?(?:px|rem|em|vw|vh|%))$/i.test(value);
  }

  if (key === "font_family") {
    return /^[a-z0-9 ,"'_-]+$/i.test(value);
  }

  return false;
}

export function applyRuntimeConfig(config, theme = "light", root = document.documentElement) {
  if (!root?.style || !isPlainObject(config)) return 0;

  let applied = 0;
  const selectedTheme = theme === "dark" ? "dark" : "light";
  const tokens = config.themes?.[selectedTheme];

  if (isPlainObject(tokens)) {
    for (const [key, cssVariable] of Object.entries(THEME_VARIABLES)) {
      const value = tokens[key];
      if (!isSafeRuntimeValue(key, value)) continue;
      root.style.setProperty(cssVariable, value);
      applied += 1;
    }
    if (isSafeRuntimeValue("font_family", tokens.font_family)) {
      root.style.setProperty("--font-family", tokens.font_family);
      applied += 1;
    }
  }

  if (isPlainObject(config.layout)) {
    for (const [key, cssVariable] of Object.entries(LAYOUT_VARIABLES)) {
      const value = config.layout[key];
      if (!isSafeRuntimeValue(key, value)) continue;
      root.style.setProperty(cssVariable, value);
      applied += 1;
    }
  }

  return applied;
}

export async function loadRuntimeConfig(client) {
  if (!client?.from) return null;
  try {
    const { data, error } = await client
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "runtime_config")
      .eq("is_public", true)
      .maybeSingle();

    if (error || !isPlainObject(data?.setting_value)) return null;
    if (data.setting_value.schema_version !== 1) return null;
    return data.setting_value;
  } catch {
    return null;
  }
}
