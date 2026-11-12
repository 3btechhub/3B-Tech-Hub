import { renderPage } from "./page-engine.js";

const RESERVED_ROOTS = new Set([
  "account", "login", "profile", "dashboard", "bd", "ksa", "global", "assets", "auth"
]);
const ROOT_PATH = new URL("../", import.meta.url).pathname.replace(/\/$/, "");

function normalizedSegments(pathname) {
  let path = decodeURIComponent(pathname);
  if (path === ROOT_PATH || path === ROOT_PATH + "/") return [];
  if (path.startsWith(ROOT_PATH + "/")) path = path.slice(ROOT_PATH.length + 1);
  else return [];
  return path.split("/").filter(Boolean);
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

async function findPage(supabase, { slug, locale, region, pageType, parentId = null }) {
  const countries = region === "global" ? ["global"] : [region, "global"];
  for (const country of countries) {
    let query = supabase.from("pages")
      .select("id,parent_id,page_type,slug,title,description,locale,country,seo,status")
      .eq("slug", slug).eq("locale", locale).eq("country", country)
      .eq("status", "published").eq("page_type", pageType);
    query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (data) return data;
  }
  return null;
}

export async function renderDynamicRoute(supabase) {
  const main = document.querySelector("main.dynamic-page-main, main.home-main");
  if (!main || !supabase) return false;

  const segments = normalizedSegments(location.pathname);
  if (segments.length < 1 || segments.length > 2) return false;
  const [mainSlug, subSlug] = segments;
  if (RESERVED_ROOTS.has(mainSlug.toLowerCase())) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(mainSlug)) return false;
  if (subSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subSlug)) return false;

  const locale = ["bn", "ar", "en"].includes(document.documentElement.lang)
    ? document.documentElement.lang : "en";
  const region = ["global", "bd", "ksa"].includes(window.siteCountry?.region)
    ? window.siteCountry.region : "global";

  try {
    let page;
    if (subSlug) {
      const parent = await findPage(supabase, {
        slug: mainSlug, locale, region, pageType: "main"
      });
      if (!parent) {
        if (main.classList.contains("dynamic-page-main")) setNotFound(main);
        return false;
      }
      page = await findPage(supabase, {
        slug: subSlug, locale, region, pageType: "sub", parentId: parent.id
      });
    } else {
      page = await findPage(supabase, {
        slug: mainSlug, locale, region, pageType: "main"
      });
    }

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
