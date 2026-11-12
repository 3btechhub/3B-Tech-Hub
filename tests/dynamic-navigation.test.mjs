import test from "node:test";
import assert from "node:assert/strict";
import { buildNavigationTree, dynamicPageHref, isSafePageSlug } from "../site/assets/dynamic-navigation.js";

test("only safe URL slugs are accepted", () => {
  assert.equal(isSafePageSlug("about-us"), true);
  assert.equal(isSafePageSlug("about%2Fadmin"), false);
  assert.equal(isSafePageSlug("../login"), false);
  assert.equal(isSafePageSlug("বাংলা"), false);
});

test("reserved static routes cannot be replaced by dynamic pages", () => {
  assert.equal(dynamicPageHref({ page_type: "main", slug: "login" }), null);
  assert.equal(dynamicPageHref({ page_type: "main", slug: "services" }).endsWith("/services/"), true);
  assert.equal(dynamicPageHref({ page_type: "main", slug: "ksa" }), null);
  assert.ok(dynamicPageHref({ page_type: "main", slug: "about-us" }).endsWith("/about-us/"));
});

test("navigation groups Sub Pages under the correct Main Page and sorts them", () => {
  const tree = buildNavigationTree([
    { id: "s2", parent_id: "m1", page_type: "sub", slug: "team", title: "Team", sort_order: 2 },
    { id: "m2", parent_id: null, page_type: "main", slug: "contact", title: "Contact", sort_order: 2 },
    { id: "m1", parent_id: null, page_type: "main", slug: "about", title: "About", sort_order: 1 },
    { id: "s1", parent_id: "m1", page_type: "sub", slug: "story", title: "Story", sort_order: 1 },
    { id: "orphan", parent_id: "missing", page_type: "sub", slug: "orphan", title: "Orphan", sort_order: 0 },
    { id: "reserved", parent_id: null, page_type: "main", slug: "dashboard", title: "Dashboard", sort_order: 0 }
  ]);
  assert.deepEqual(tree.map(page => page.slug), ["about", "contact"]);
  assert.deepEqual(tree[0].children.map(page => page.slug), ["story", "team"]);
  assert.equal(tree[0].children[0].href.endsWith("/about/story/"), true);
  assert.equal(tree[1].children.length, 0);
});


test("country-specific Main Pages override Global and country Sub Pages stay scoped", () => {
  const tree = buildNavigationTree([
    { id: "global", parent_id: null, page_type: "main", slug: "about", title: "Global About", country: "global", sort_order: 1 },
    { id: "bd", parent_id: null, page_type: "main", slug: "about", title: "Bangladesh About", country: "bd", sort_order: 1 },
    { id: "global-child", parent_id: "global", page_type: "sub", slug: "contact", title: "Global Contact", country: "global" },
    { id: "bd-child", parent_id: "bd", page_type: "sub", slug: "contact", title: "BD Contact", country: "bd" }
  ], "bd");
  assert.equal(tree.length, 1);
  assert.equal(tree[0].title, "Bangladesh About");
  assert.equal(tree[0].children[0].title, "BD Contact");
});
