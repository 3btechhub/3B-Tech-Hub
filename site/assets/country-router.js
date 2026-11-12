(() => {
  "use strict";
  const BASE = "/3btechhub/";
  const MANUAL_KEY = "3b-country-manual";
  const CONTEXT_KEY = "3b-country-context";
  const path = window.location.pathname;
  const regionFromPath = () => {
    if (path === BASE + "bd/" || path.startsWith(BASE + "bd/")) return "bd";
    if (path === BASE + "saudi/" || path.startsWith(BASE + "saudi/")) return "saudi";
    if (path === BASE + "ksa/" || path.startsWith(BASE + "ksa/")) return "ksa";
    if (path === BASE + "global/" || path.startsWith(BASE + "global/")) return "global";
    return null;
  };
  const countryData = (region, source) => ({
    region: region === "ksa" ? "saudi" : region,
    code: region === "bd" ? "BD" : (region === "saudi" || region === "ksa") ? "SA" : "OTHER",
    name: region === "bd" ? "Bangladesh" : (region === "saudi" || region === "ksa") ? "Saudi Arabia" : "Global",
    currency: region === "bd" ? "BDT" : (region === "saudi" || region === "ksa") ? "SAR" : "USD",
    source
  });
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
  if (isEntryPath) {
    let manuallySelected = null;
    try { manuallySelected = localStorage.getItem(MANUAL_KEY); } catch (_) {}
    if (["bd", "saudi", "global"].includes(manuallySelected)) { routeHome(manuallySelected); return; }
  }
  const pathRegion = regionFromPath();
  if (pathRegion === "bd" || pathRegion === "saudi" || pathRegion === "ksa" || pathRegion === "global") {
    if (pathRegion === "ksa") { window.location.replace(BASE + "saudi/"); return; }
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
    if (isEntryPath) routeHome(region);
  };
  const showPrompt = () => {
    // If automatic route detection is unavailable, use the neutral route.
    // Visitors can change the active route only from the site menu.
    finish("global", "default");
  };
  // For ordinary internal pages, reuse the last resolved context; the entry route always performs a fresh lookup.
  if (!isEntryPath && path !== BASE + "global/") {
    try {
      const cached = JSON.parse(localStorage.getItem(CONTEXT_KEY) || "null");
      if (cached && ["bd", "saudi", "global"].includes(cached.region)) {
        applyContext(cached.region, "session");
        window.countryContextReady = Promise.resolve(window.siteCountry);
        return;
      }
    } catch (_) {}
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  fetch("https://ipwho.is/", { signal: controller.signal, cache: "no-store" })
    .then((response) => { if (!response.ok) throw new Error("Country lookup failed"); return response.json(); })
    .then((data) => {
      if (!data || data.success !== true || !data.country_code) throw new Error("No country result");
      const code = String(data.country_code).toUpperCase();
      finish(code === "BD" ? "bd" : code === "SA" ? "saudi" : "global", "ip");
    })
    .catch(showPrompt)
    .finally(() => window.clearTimeout(timeout));
})();