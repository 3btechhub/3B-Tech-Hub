(() => {
  "use strict";

  const BASE = "/3btechhub/";
  const MANUAL_KEY = "3b-country-manual";
  const CONTEXT_KEY = "3b-country-context";
  const REGIONS = ["global", "bd", "ksa"];
  const path = window.location.pathname;

  const normalizeRegion = (value) => value === "saudi" ? "ksa" : value;
  const regionFromPath = () => {
    const match = path.match(/^\/3btechhub\/(global|bd|ksa|saudi)(?:\/|$)/);
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
    window.siteCountry = context;
    try { localStorage.setItem(CONTEXT_KEY, JSON.stringify(context)); } catch (_) {}
    document.documentElement.dataset.country = context.region;
    document.documentElement.dataset.countryCode = context.code;
    document.documentElement.dataset.countryReady = "true";
    window.dispatchEvent(new CustomEvent("countrycontextready", { detail: context }));
    return context;
  };
  const routeHome = (region) => window.location.replace(BASE + region + "/");
  const isEntryPath = path === BASE || path === BASE.slice(0, -1);

  const pathRegion = regionFromPath();
  if (pathRegion) {
    if (path.startsWith(BASE + "saudi/")) {
      routeHome("ksa");
      return;
    }
    applyContext(pathRegion, "url");
    window.countryContextReady = Promise.resolve(window.siteCountry);
    return;
  }

  let resolveContext;
  window.countryContextReady = new Promise((resolve) => { resolveContext = resolve; });
  let settled = false;
  const finish = (region, source) => {
    if (settled) return;
    settled = true;
    const context = applyContext(region, source);
    resolveContext(context);
    if (isEntryPath) routeHome(context.region);
  };

  if (isEntryPath) {
    try {
      const manual = normalizeRegion(localStorage.getItem(MANUAL_KEY));
      if (REGIONS.includes(manual)) {
        finish(manual, "manual");
        return;
      }
    } catch (_) {}
  } else {
    try {
      const cached = JSON.parse(localStorage.getItem(CONTEXT_KEY) || "null");
      const cachedRegion = normalizeRegion(cached?.region);
      if (REGIONS.includes(cachedRegion)) {
        finish(cachedRegion, "session");
        return;
      }
    } catch (_) {}
  }

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