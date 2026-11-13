import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const registry = JSON.parse(readFileSync("site/assets/icons/registry.json", "utf8"));
const iconNames = new Set(Object.keys(registry.icons));

test("the versioned icon library contains only standalone 24x24 SVG assets", () => {
  assert.equal(registry.version, 1);
  assert.ok(iconNames.size >= 40);
  for (const [name, svg] of Object.entries(registry.icons)) {
    assert.match(name, /^[A-Za-z][A-Za-z0-9]*$/);
    assert.match(svg, /^<svg\b[^>]*viewBox="0 0 24 24"/);
    assert.match(svg, /<\/(?:svg)>$/);
    assert.doesNotMatch(svg, /<(?:script|foreignObject|image|use)\b|\son[a-z]+\s*=|\b(?:href|xlink:href)\s*=/i);
    const tags = [...svg.matchAll(/<\/?([A-Za-z][\w:-]*)\b/g)].map((match) => match[1].toLowerCase());
    for (const tag of tags) assert.ok(["svg","path","circle","rect","line","polyline","polygon","ellipse"].includes(tag), name + " contains unsupported SVG element " + tag);
  }
});

test("every declared page icon resolves to a registered SVG", () => {
  const pages = ["site/index.html", ...readdirSync("site/views").filter((name) => name.endsWith(".html")).map((name) => join("site/views", name))];
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    const attributes = [...html.matchAll(/(?:data-icon|data-svg-icon)="([^"]+)"/g)].map((match) => match[1]);
    for (const key of attributes) {
      assert.ok(iconNames.has(key), page + " references missing SVG icon: " + key);
      assert.doesNotMatch(key, /\p{Extended_Pictographic}/u, page + " contains an emoji icon reference");
    }
  }
});

test("contact brand icons are rendered locally as SVG, never remote image assets", () => {
  const source = readFileSync("site/assets/contact-utils.js", "utf8");
  assert.match(source, /createIcon\(BRANDS\[brand\]\?\.icon\|\|"link"/);
  assert.doesNotMatch(source, /cdn\.simpleicons|uxwing\.com|createElement\(["']img["']\)/i);
});

test("the application loads the public registry and renders page icon attributes", () => {
  const source = readFileSync("site/assets/app.js", "utf8");
  assert.match(source, /loadSvgIconRegistry\(supabase\)/);
  assert.match(source, /renderSvgIconAttributes\(document\)/);
  const home = readFileSync("site/index.html", "utf8");
  assert.match(home, /<svg class="menu-icon"/);
});
