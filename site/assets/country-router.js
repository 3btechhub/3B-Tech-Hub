(() => {
  "use strict";
  const MANUAL_KEY = "3b-country-manual";
  const CONTEXT_KEY = "3b-country-context";
  const REGIONS = ["global", "bd", "ksa"];
  const params = new URLSearchParams(window.location.search);
  window.siteInitialRoute = params.get("route") || window.location.pathname;
  const normalizeRegion = (value) => value === "saudi" ? "ksa" : value;
  const regionFromPath = (value) => {
    const match = String(value || "").match(/^\/3btechhub\/(global|bd|ksa|saudi)(?:\/|$)/);
    return match ? normalizeRegion(match[1]) : null;
  };
  const countryData = (region, source) => {
    const normalized = REGIONS.includes(normalizeRegion(region)) ? normalizeRegion(region) : "global";
    return {
      region: normalized,
      code: normalized === "bd" ? "BD" : normalized === "ksa" ? "SA" : "GLOBAL",
      name: normalized === "bd" ? "Bangladesh" : normalized === "ksa" ? "Saudi Arabia" : "Global",
      source
    };
  };
  const applyContext = (region, source) => {
    const context = countryData(region, source);
    if (window.siteCountry && typeof window.siteCountry === "object") Object.assign(window.siteCountry, context);
    else window.siteCountry = context;
    const active = window.siteCountry;
    try { localStorage.setItem(CONTEXT_KEY, JSON.stringify(active)); } catch (_) {}
    document.documentElement.dataset.country = active.region;
    document.documentElement.dataset.countryCode = active.code;
    document.documentElement.dataset.countryReady = "true";
    window.dispatchEvent(new CustomEvent("countrycontextready", { detail: active }));
    return active;
  };
  window.setSiteCountryContext = applyContext;
  let resolveContext;
  window.countryContextReady = new Promise((resolve) => { resolveContext = resolve; });
  let settled = false;
  const finish = (region, source) => {
    if (settled) return;
    settled = true;
    resolveContext(applyContext(region, source));
  };
  const routeRegion = regionFromPath(window.siteInitialRoute);
  if (routeRegion) {
    finish(routeRegion, "url");
    return;
  }
  try {
    const manual = normalizeRegion(localStorage.getItem(MANUAL_KEY));
    if (REGIONS.includes(manual)) { finish(manual, "manual"); return; }
    const cached = JSON.parse(localStorage.getItem(CONTEXT_KEY) || "null");
    const cachedRegion = normalizeRegion(cached?.region);
    if (REGIONS.includes(cachedRegion)) { finish(cachedRegion, "session"); return; }
  } catch (_) {}
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);
  fetch("https://ipwho.is/", { signal: controller.signal, cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Country lookup failed");
      return response.json();
    })
    .then((data) => {
      if (!data || data.success !== true || !data.country_code) throw new Error("Country unavailable");
      const code = String(data.country_code).toUpperCase();
      finish(code === "BD" ? "bd" : code === "SA" ? "ksa" : "global", "ip");
    })
    .catch(() => finish("global", "fallback"))
    .finally(() => window.clearTimeout(timeout));
})();
