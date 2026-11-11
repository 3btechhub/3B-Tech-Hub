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
    if (settled) return;
    let manual = null;
    try { manual = localStorage.getItem(MANUAL_KEY); } catch (_) {}
    if (["bd", "saudi", "global"].includes(manual)) { finish(manual, "manual"); return; }
    const render = () => {
      if (settled) return;
      document.documentElement.dataset.countryReady = "true";
      if (document.getElementById("country-detection-prompt")) return;
      const overlay = document.createElement("div");
      overlay.id = "country-detection-prompt";
      overlay.className = "country-prompt-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-labelledby", "country-prompt-title");
      overlay.innerHTML = '<div class="country-prompt"><h2 id="country-prompt-title">Select Your Country</h2><p>We could not detect your location. Please choose an option to continue.</p><div class="country-choice-list"><button type="button" data-region="bd">Bangladesh</button><button type="button" data-region="saudi">Saudi Arabia</button><button type="button" data-region="global">Other Countries</button></div></div>';
      overlay.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-region]");
        if (!button) return;
        const region = button.dataset.region;
        try { localStorage.setItem(MANUAL_KEY, region); } catch (_) {}
        overlay.remove();
        finish(region, "manual");
        if (isEntryPath) routeHome(region);
      });
      document.body.appendChild(overlay);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
    else render();
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