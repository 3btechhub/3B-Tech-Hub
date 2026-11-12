const ROOT_PATH = new URL("../", import.meta.url).pathname;

function node(tag, className, value) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (value != null) item.textContent = String(value);
  return item;
}

function pageHref(page, parent) {
  const root = parent ? parent.slug + "/" + page.slug : page.slug;
  return ROOT_PATH + root + "/";
}

function renderPageCard(page, parent) {
  const card = node("article", "home-page-card");
  if (page.image_url && /^https?:\/\//i.test(page.image_url)) {
    const image = document.createElement("img");
    image.src = page.image_url;
    image.alt = page.title || "Page image";
    image.loading = "lazy";
    card.append(image);
  }
  const heading = document.createElement("h3");
  const link = node("a", "", page.title || page.slug);
  link.href = pageHref(page, parent);
  heading.append(link);
  card.append(heading);
  if (page.description) card.append(node("p", "home-page-description", page.description));
  const details = [
    page.location,
    page.phone_number ? "Phone: " + page.phone_number : "",
    page.whatsapp_number ? "WhatsApp: " + page.whatsapp_number : "",
    page.email
  ].filter(Boolean);
  if (details.length) {
    const meta = node("p", "home-page-meta", details.join(" · "));
    card.append(meta);
  }
  return card;
}

export async function renderHomeSections(supabase) {
  const root = document.querySelector("main.home-main");
  if (!root || !supabase) return false;
  const locale = ["en", "bn", "ar"].includes(document.documentElement.lang)
    ? document.documentElement.lang : "en";
  const region = ["global", "bd", "ksa"].includes(window.siteCountry?.region)
    ? window.siteCountry.region : "global";
  const countries = region === "global" ? ["global"] : [region, "global"];

  const { data: pages, error } = await supabase.from("pages")
    .select("id,parent_id,page_type,slug,title,description,locale,country,status,sort_order,visibility,location,phone_number,whatsapp_number,email,image_url")
    .eq("locale", locale).eq("status", "published").eq("visibility", true)
    .in("country", countries)
    .order("sort_order", { ascending: true }).order("title", { ascending: true });
  if (error) {
    console.warn("Homepage sections are temporarily unavailable.");
    return false;
  }

  const mainPages = (pages || []).filter(page => page.page_type === "main" && !page.parent_id);
  if (!mainPages.length) return false;
  const fragment = document.createDocumentFragment();
  const heading = node("h1", "home-content-title", root.querySelector("h1")?.textContent || "3B TECH HUB");
  fragment.append(heading);

  for (const main of mainPages) {
    const section = node("section", "home-content-section");
    section.id = "home-" + main.slug;
    const sectionHeading = document.createElement("h2");
    const mainLink = node("a", "", main.title || main.slug);
    mainLink.href = pageHref(main, null);
    sectionHeading.append(mainLink);
    section.append(sectionHeading);
    if (main.description) section.append(node("p", "home-section-description", main.description));

    const children = pages.filter(page => page.page_type === "sub" && page.parent_id === main.id
      && (page.country === main.country || page.country === region || page.country === "global"));
    if (children.length) {
      const grid = node("div", "home-page-grid");
      for (const child of children) grid.append(renderPageCard(child, main));
      section.append(grid);
    }
    fragment.append(section);
  }

  root.classList.add("has-home-content");
  root.replaceChildren(fragment);
  return true;
}
