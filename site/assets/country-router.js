(() => {
  "use strict";
  const BASE = "/3btechhub/";
  const status = document.getElementById("country-routing-status");
  const fallback = document.getElementById("country-fallback");
  const target = (region) => BASE + region + "/";
  const showFallback = () => {
    if (status) status.textContent = "Your country could not be detected.";
    if (fallback) fallback.hidden = false;
  };
  // Explicit regional URLs are always respected; detection runs only on the root entry.
  const path = window.location.pathname.replace(/\/+$/, "") + "/";
  if (path !== BASE) return;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  fetch("https://ipwho.is/", { signal: controller.signal, cache: "no-store" })
    .then((response) => { if (!response.ok) throw new Error("Country lookup failed"); return response.json(); })
    .then((data) => {
      if (!data || data.success !== true || !data.country_code) throw new Error("No country result");
      const code = String(data.country_code).toUpperCase();
      const region = code === "BD" ? "bd" : code === "SA" ? "ksa" : "global";
      window.location.replace(target(region));
    })
    .catch(showFallback)
    .finally(() => window.clearTimeout(timeout));
})();