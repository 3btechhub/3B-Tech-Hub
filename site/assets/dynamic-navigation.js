const RESERVED_ROOTS = new Set([
  "login", "profile", "dashboard", "services", "products", "workshop",
  "technicians", "bd", "saudi", "global", "assets", "auth"
]);
const ROOT_PATH = new URL("../", import.meta.url).pathname;

export function isSafePageSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function dynamicPageHref(page, parent = null) {
  if (!page || !isSafePageSlug(page.slug)) return null;
  if (page.page_type === "main" && !parent && !RESERVED_ROOTS.has(page.slug.toLowerCase())) {
    return ROOT_PATH + page.slug + "/";
  }
  if (page.page_type === "sub" && parent && isSafePageSlug(parent.slug)) {
    return ROOT_PATH + parent.slug + "/" + page.slug + "/";
  }
  return null;
}

export function buildNavigationTree(rows) {
  const pages = Array.isArray(rows) ? rows : [];
  const mains = pages.filter(page => page.page_type === "main" && !page.parent_id && isSafePageSlug(page.slug) && !RESERVED_ROOTS.has(page.slug.toLowerCase()));
  const compare = (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || String(a.title || "").localeCompare(String(b.title || ""));
  return mains.sort(compare).map(main => ({
    ...main,
    href: dynamicPageHref(main),
    children: pages
      .filter(page => page.page_type === "sub" && page.parent_id === main.id && isSafePageSlug(page.slug))
      .sort(compare)
      .map(page => ({ ...page, href: dynamicPageHref(page, main) }))
  }));
}

export async function renderDynamicNavigation(supabase) {
  const menu = document.querySelector("#site-menu");
  const primary = menu?.querySelector(".menu-primary");
  if (!menu || !primary || !supabase) return false;

  let section = menu.querySelector(".menu-dynamic-pages");
  if (!section) {
    section = document.createElement("div");
    section.className = "menu-section menu-dynamic-pages";
    section.setAttribute("aria-label", "Website pages");
    primary.insertAdjacentElement("afterend", section);
  }
  section.replaceChildren();

  const locale = ["bn", "ar", "en"].includes(document.documentElement.lang)
    ? document.documentElement.lang : "en";
  const { data, error } = await supabase.from("pages")
    .select("id,parent_id,page_type,slug,title,locale,status,sort_order,show_in_navigation")
    .eq("locale", locale).eq("status", "published").eq("show_in_navigation", true)
    .order("sort_order", { ascending: true }).order("title", { ascending: true });
  if (error) {
    section.hidden = true;
    console.warn("Dynamic navigation is temporarily unavailable.");
    return false;
  }

  const tree = buildNavigationTree(data || []);
  for (const main of tree) {
    const group = document.createElement("div");
    group.className = "menu-dynamic-page-group";
    const mainLink = document.createElement("a");
    mainLink.className = "menu-link";
    mainLink.href = main.href;
    mainLink.textContent = main.title || main.slug;
    group.append(mainLink);

    for (const child of main.children) {
      const childLink = document.createElement("a");
      childLink.className = "menu-link menu-sub-link";
      childLink.href = child.href;
      childLink.textContent = child.title || child.slug;
      group.append(childLink);
    }
    section.append(group);
  }
  section.hidden = tree.length === 0;

  const currentPath = location.pathname.replace(/\/+$/, "") || "/";
  section.querySelectorAll("a[href]").forEach(link => {
    const targetPath = new URL(link.href, location.href).pathname.replace(/\/+$/, "") || "/";
    if (targetPath === currentPath) {
      link.hidden = true;
      link.setAttribute("aria-current", "page");
    }
  });
  return true;
}
