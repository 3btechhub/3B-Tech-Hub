const COMPONENTS = new Set(["hero", "rich_text", "image", "card_grid", "button_group", "faq", "spacer"]);
const MAX_COMPONENTS = 80;
const MAX_TEXT = 12000;

function safeText(value, max = MAX_TEXT) {
  return typeof value === "string" ? value.slice(0, max) : "";
}
function safeHref(value) {
  if (typeof value !== "string" || value.length > 2048) return "#";
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = safeText(text);
  return node;
}
function renderCardGrid(config) {
  const grid = element("div", "dynamic-card-grid");
  for (const card of (Array.isArray(config.cards) ? config.cards.slice(0, 24) : [])) {
    if (!card || typeof card !== "object") continue;
    const article = element("article", "dynamic-card");
    article.append(element("h3", "", card.title));
    if (card.description) article.append(element("p", "", card.description));
    if (card.href) {
      const link = element("a", "dynamic-card-link", card.link_text || "View");
      link.href = safeHref(card.href);
      article.append(link);
    }
    grid.append(article);
  }
  return grid;
}
function renderComponent(component) {
  const config = component?.component_config && typeof component.component_config === "object" ? component.component_config : {};
  switch (component?.component_type) {
    case "hero": {
      const section = element("section", "dynamic-hero");
      section.append(element("h1", "", config.title));
      if (config.description) section.append(element("p", "", config.description));
      return section;
    }
    case "rich_text": {
      const section = element("section", "dynamic-rich-text");
      section.append(element("h2", "", config.heading));
      if (config.text) section.append(element("p", "", config.text));
      return section;
    }
    case "image": {
      const section = element("figure", "dynamic-image");
      const image = document.createElement("img");
      image.src = safeHref(config.src);
      image.alt = safeText(config.alt, 300);
      image.loading = "lazy";
      section.append(image);
      if (config.caption) section.append(element("figcaption", "", config.caption));
      return section;
    }
    case "card_grid": return renderCardGrid(config);
    case "button_group": {
      const group = element("div", "dynamic-button-group");
      for (const item of (Array.isArray(config.items) ? config.items.slice(0, 12) : [])) {
        if (!item || typeof item !== "object") continue;
        const link = element("a", "dynamic-button", item.label);
        link.href = safeHref(item.href);
        group.append(link);
      }
      return group;
    }
    case "faq": {
      const section = element("section", "dynamic-faq");
      for (const item of (Array.isArray(config.items) ? config.items.slice(0, 30) : [])) {
        if (!item || typeof item !== "object") continue;
        const details = document.createElement("details");
        details.append(element("summary", "", item.question), element("p", "", item.answer));
        section.append(details);
      }
      return section;
    }
    case "spacer": {
      const spacer = element("div", "dynamic-spacer");
      const height = Number(config.height);
      spacer.style.height = `${Number.isFinite(height) ? Math.max(0, Math.min(height, 240)) : 24}px`;
      return spacer;
    }
    default: return null;
  }
}
export function renderPage(page, components, root) {
  if (!page || !root || !Array.isArray(components)) return false;
  root.replaceChildren();
  root.append(element("h1", "dynamic-page-title", page.title));
  const ordered = components.filter(item => item?.is_visible !== false && COMPONENTS.has(item?.component_type))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).slice(0, MAX_COMPONENTS);
  for (const item of ordered) {
    const node = renderComponent(item);
    if (node) root.append(node);
  }
  return true;
}
export function isRegisteredComponent(type) { return COMPONENTS.has(type); }
