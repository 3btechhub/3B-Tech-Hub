import { initRoutePage } from "./app.js";

const BASE = "/3btechhub/";
const main = document.getElementById("app-main");
const viewFiles = { home:"home.html", account:"account.html", profile:"profile.html", dashboard:"dashboard.html" };
const titles = { home:"3B TECH HUB", account:"Account | 3B TECH HUB", profile:"My Account | 3B TECH HUB", dashboard:"Dashboard | 3B TECH HUB" };

function normalizedPath(value) {
  const url = new URL(value, window.location.origin);
  let path = url.pathname;
  if (path === BASE.slice(0, -1)) path = BASE + "home/";
  if (path === BASE) path = BASE + "home/";
  if (!path.startsWith(BASE)) return null;
  return (path.endsWith("/") ? path : path + "/") + url.search + url.hash;
}
function routeDetails(path) {
  const pathname = new URL(path, window.location.origin).pathname;
  const first = pathname.slice(BASE.length).split("/").filter(Boolean)[0] || "";
  if (!first) return { view:"home" };
  if (first === "login") return { view:"account" };
  if (["account","profile","dashboard"].includes(first)) return { view:first };
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
  const path = normalizedPath(requestedPath) || BASE;
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
  main.innerHTML = source.innerHTML;
  resolveFragmentLinks(main, path);
  document.title = titles[details.view];
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  const homeLink = document.getElementById("home-menu-link");
  if (homeLink) homeLink.hidden = details.view === "home";
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
const routeParam = new URLSearchParams(window.location.search).get("route");
const initialPath = normalizedPath(routeParam || (window.location.pathname + window.location.search + window.location.hash)) || (BASE + "home/");
try {
  await renderRoute(initialPath, { replace:true });
} catch (error) {
  console.error("Website route could not be rendered.", error);
  main.textContent = "This page could not be loaded. Please refresh and try again.";
}
