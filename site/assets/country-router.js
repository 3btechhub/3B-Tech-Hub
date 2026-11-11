(() => {
  "use strict";
  const BASE = "/3btechhub/";
  const MANUAL_KEY = "3b-country-manual";
  const regionFromPath = () => {
    const path = window.location.pathname;
    if (path === BASE + "bd/" || path.startsWith(BASE + "bd/")) return "bd";
    if (path === BASE + "ksa/" || path.startsWith(BASE + "ksa/")) return "ksa";
    if (path === BASE + "global/" || path.startsWith(BASE + "global/")) return "global";
    return null;
  };
  const countryData = (region, source) => ({
    region, code: region === "bd" ? "BD" : region === "ksa" ? "SA" : "OTHER",
    name: region === "bd" ? "Bangladesh" : region === "ksa" ? "Saudi Arabia" : "Global",
    currency: region === "bd" ? "BDT" : region === "ksa" ? "SAR" : "USD", source
  });
  const applyContext = (region, source) => {
    const context = countryData(region, source);
    window.siteCountry = context;
    document.documentElement.dataset.country = region;
    document.documentElement.dataset.countryCode = context.code;
    window.dispatchEvent(new CustomEvent("countrycontextready", { detail: context }));
    return context;
  };
  const routeHome = (region) => window.location.replace(BASE + region + "/");
  const pathRegion = regionFromPath();
  if (pathRegion) {
    applyContext(pathRegion, "url");
    window.countryContextReady = Promise.resolve(window.siteCountry);
    return;
  }
  const manual = localStorage.getItem(MANUAL_KEY);
  if (["bd", "ksa", "global"].includes(manual)) {
    applyContext(manual, "manual");
    window.countryContextReady = Promise.resolve(window.siteCountry);
    return;
  }
  let resolveContext;
  window.countryContextReady = new Promise((resolve) => { resolveContext = resolve; });
  const finish = (region, source) => {
    const context = applyContext(region, source);
    resolveContext(context);
    if (window.location.pathname === BASE) routeHome(region);
  };
  const showPrompt = () => {
    const render = () => {
      if (document.getElementById("country-detection-prompt")) return;
      const overlay = document.createElement("div");
      overlay.id = "country-detection-prompt";
      overlay.className = "country-prompt-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-labelledby", "country-prompt-title");
      overlay.innerHTML = '<div class="country-prompt"><h2 id="country-prompt-title">Select Your Region</h2><p>We could not detect your country from your network. Please choose your region to continue.</p><div class="country-choice-list"><button type="button" data-region="bd">Bangladesh</button><button type="button" data-region="ksa">Saudi Arabia</button><button type="button" data-region="global">Global / Other Countries</button></div></div>';
      overlay.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-region]");
        if (!button) return;
        const region = button.dataset.region;
        localStorage.setItem(MANUAL_KEY, region);
        overlay.remove();
        finish(region, "manual");
      });
      document.body.appendChild(overlay);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
    else render();
  };
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  fetch("https://ipwho.is/", { signal: controller.signal, cache: "no-store" })
    .then((response) => { if (!response.ok) throw new Error("Country lookup failed"); return response.json(); })
    .then((data) => {
      if (!data || data.success !== true || !data.country_code) throw new Error("No country result");
      const code = String(data.country_code).toUpperCase();
      finish(code === "BD" ? "bd" : code === "SA" ? "ksa" : "global", "ip");
    })
    .catch(showPrompt)
    .finally(() => window.clearTimeout(timeout));
})();