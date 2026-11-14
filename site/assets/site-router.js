import { initRoutePage, resolveAuthRoute } from "./app.js";

const BASE = "/3btechhub/";
const main = document.getElementById("app-main");
const viewFiles = { home:"home.html", account:"account.html", dashboard:"dashboard.html", catalogue:"catalogue.html" };
const titles = { home:"3B TECH HUB", account:"Account | 3B TECH HUB", dashboard:"Dashboard | 3B TECH HUB", catalogue:"3B TECH HUB" };

function normalizedPath(value) {
  const url = new URL(value, window.location.origin);
  let path = url.pathname;
  if (path === BASE.slice(0, -1) || path === BASE) path = BASE + "home/";
  if (!path.startsWith(BASE)) return null;
  return (path.endsWith("/") ? path : path + "/") + url.search + url.hash;
}
function routeDetails(path) {
  const pathname = new URL(path, window.location.origin).pathname;
  const parts = pathname.slice(BASE.length).split("/").filter(Boolean);
  const first = parts[0] || "";
  const legacy = { login:"login", "create-account":"signup", "forgot-password":"recovery-start", "reset-password":"recovery-start", profile:"profile", "edit-profile":"edit-profile" };
  if (first === "account") {
    const child = parts[1] || "login";
    const modes = { login:"login", "create-account":"signup", "reset-password":"recovery-start", profile:"profile", "edit-profile":"edit-profile" };
    return { view:"account", authMode:modes[child] || "login" };
  }
  if (first === "edit-profile") return { view:"account", authMode:"edit-profile" };
  if (legacy[first]) return { view:"account", authMode:legacy[first] };
  if (["home","dashboard"].includes(first)) return { view:first };
  if (["service-types","device-types","services","products","workshops","technicians","contacts"].includes(first)) { const recordPart=parts[1] || ""; return { view:"catalogue", module:first, recordKey:recordPart ? decodeURIComponent(recordPart) : "" }; }
  return { view:"home" };
}
function resolveFragmentLinks(container, routePath) {
  for (const anchor of container.querySelectorAll("a[href]")) {
    const raw = anchor.getAttribute("href");
    if (!raw || raw.startsWith("#") || /^(?:mailto:|tel:|javascript:|https?:)/i.test(raw)) continue;
    const resolved = new URL(raw, new URL(routePath, window.location.origin));
    anchor.href = resolved.pathname + resolved.search + resolved.hash;
  }
}
async function renderRoute(requestedPath, { replace = false } = {}) {
  const requested = normalizedPath(requestedPath) || BASE + "home/";
  const path = await resolveAuthRoute(requested);
  if (path !== requested) {
    history.replaceState({ route:path }, "", path);
    return renderRoute(path, { replace:true });
  }
  const details = routeDetails(path);
  const response = await fetch(BASE + "views/" + viewFiles[details.view], { cache:"no-store" });
  if (!response.ok) throw new Error("Could not load the requested page.");
  const parsed = new DOMParser().parseFromString(await response.text(), "text/html");
  const source = parsed.querySelector("main");
  if (!source) throw new Error("Page view is missing its main content.");
  for (const attribute of Array.from(main.attributes)) if (attribute.name !== "id") main.removeAttribute(attribute.name);
  for (const attribute of Array.from(source.attributes)) if (attribute.name !== "id") main.setAttribute(attribute.name, attribute.value);
  main.id = "app-main";
  main.dataset.view = details.view;
  if (details.module) main.dataset.module=details.module; else delete main.dataset.module;
  if (details.recordKey) main.dataset.recordKey=details.recordKey; else delete main.dataset.recordKey;
  if (details.authMode) main.dataset.authMode=details.authMode; else delete main.dataset.authMode;
  main.innerHTML = source.innerHTML;
  resolveFragmentLinks(main, path);
  document.title = titles[details.view];
  document.documentElement.lang = "en";
  document.documentElement.dir = "rtl";
  const homeLink = document.getElementById("home-menu-link");
  if (homeLink) homeLink.hidden = false;
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (details.view === "dashboard") {
    const meta = robotsMeta || document.head.appendChild(document.createElement("meta"));
    meta.name = "robots";
    meta.content = "noindex,nofollow";
  } else if (robotsMeta) robotsMeta.remove();
  window.siteCurrentRoute = path;
  await initRoutePage();
  window.scrollTo({ top:0, behavior:"auto" });
  if (replace) history.replaceState({ route:path }, "", path);
}
window.navigateSiteRoute = (target, options = {}) => {
  const path = normalizedPath(target);
  if (!path) return;
  if (options.replace) history.replaceState({ route:path }, "", path);
  else history.pushState({ route:path }, "", path);
  void renderRoute(path).catch((error) => { console.error("Website route could not be rendered.", error); main.textContent = "This page could not be loaded. Please refresh and try again."; });
};
document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[href]");
  if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith(BASE)) return;
  event.preventDefault();
  window.navigateSiteRoute(url.pathname + url.search + url.hash);
});
window.addEventListener("popstate", () => { void renderRoute(window.location.pathname + window.location.search).catch((error) => { console.error("Website route could not be rendered.", error); main.textContent = "This page could not be loaded. Please refresh and try again."; }); });
const initialParams = new URLSearchParams(window.location.search);
const routeParam = initialParams.get("route");
initialParams.delete("route");
const passthroughQuery = initialParams.toString();
const initialTarget = routeParam
  ? routeParam + (passthroughQuery ? (routeParam.includes("?") ? "&" : "?") + passthroughQuery : "") + window.location.hash
  : (window.location.pathname + window.location.search + window.location.hash);
const initialPath = normalizedPath(initialTarget) || (BASE + "home/");
try {
  await renderRoute(initialPath, { replace:true });
} catch (error) {
  console.error("Website route could not be rendered.", error);
  main.textContent = "This page could not be loaded. Please refresh and try again.";
}