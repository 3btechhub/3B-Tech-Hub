import { renderPage } from "./page-engine.js";

const RESERVED_ROOTS = new Set([
  "login", "profile", "dashboard", "services", "products", "workshop",
  "technicians", "bd", "saudi", "global", "assets", "auth"
]);
const ROOT_PATH = new URL("../", import.meta.url).pathname.replace(/\/$/, "");

export function normalizedSegments(pathname) {
  if (typeof pathname !== "string") return [];
  if (pathname === ROOT_PATH || pathname === ROOT_PATH + "/") return [];
  if (!pathname.startsWith(ROOT_PATH + "/")) return [];

  const rawSegments = pathname.slice(ROOT_PATH.length + 1).split("/").filter(Boolean);
  if (rawSegments.length < 1 || rawSegments.length > 2) return [];

  let segments;
  try {
    segments = rawSegments.map(segment => decodeURIComponent(segment));
  } catch {
    return [];
  }

  if (segments.some(segment =>
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment) ||
    segment.includes("/") || segment.includes("\\")
  )) return [];

  return segments;
}

function setNotFound(main) {
  main.replaceChildren();
  const wrap = document.createElement("div");
  const heading = document.createElement("h1");
  heading.textContent = "Page not found";
  const message = document.createElement("p");
  message.textContent = "The page you are looking for is unavailable.";
  const link = document.createElement("a");
  link.href = ROOT_PATH + "/";
  link.textContent = "Return to 3B TECH HUB";
  wrap.append(heading, message, link);
  main.append(wrap);
}

export async function renderDynamicRoute(supabase) {
  const main = document.querySelector("main.dynamic-page-main, main.home-main");
  if (!main || !supabase) return false;

  const segments = normalizedSegments(location.pathname);
  if (segments.length < 1 || segments.length > 2) return false;
  const [mainSlug, subSlug] = segments;
  if (RESERVED_ROOTS.has(mainSlug.toLowerCase())) return false;

  const locale = ["bn", "ar", "en"].includes(document.documentElement.lang)
    ? document.documentElement.lang : "en";

  try {
    let pageQuery = supabase.from("pages").select("id,parent_id,page_type,slug,title,description,locale,seo,status")
      .eq("slug", subSlug || mainSlug).eq("locale", locale).eq("status", "published").limit(1);
    if (subSlug) {
      const { data: parent, error: parentError } = await supabase.from("pages")
        .select("id").is("parent_id", null).eq("page_type", "main")
        .eq("slug", mainSlug).eq("locale", locale).eq("status", "published").maybeSingle();
      if (parentError || !parent) return false;
      pageQuery = pageQuery.eq("parent_id", parent.id).eq("page_type", "sub");
    } else {
      pageQuery = pageQuery.is("parent_id", null).eq("page_type", "main");
    }

    const { data: page, error } = await pageQuery.maybeSingle();
    if (error) throw error;
    if (!page) {
      if (main.classList.contains("dynamic-page-main")) setNotFound(main);
      return false;
    }

    const { data: components, error: componentError } = await supabase.from("page_components")
      .select("id,slot,component_type,component_config,sort_order,is_visible")
      .eq("page_id", page.id).eq("is_visible", true).order("sort_order", { ascending: true }).limit(80);
    if (componentError) throw componentError;

    const content = document.createElement("main");
    content.className = "dynamic-page-main";
    renderPage(page, components || [], content);
    main.replaceWith(content);
    document.title = (typeof page.seo?.title === "string" && page.seo.title.trim())
      ? page.seo.title.slice(0, 180) : page.title + " | 3B TECH HUB";
    const description = typeof page.seo?.description === "string"
      ? page.seo.description.slice(0, 300) : page.description;
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    if (description) meta.content = description;
    return true;
  } catch (error) {
    console.error("Dynamic page could not be loaded.", error);
    return false;
  }
}
