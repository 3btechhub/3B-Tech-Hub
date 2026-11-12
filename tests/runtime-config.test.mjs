import test from "node:test";
import assert from "node:assert/strict";
import { applyRuntimeConfig, isSafeRuntimeValue, loadRuntimeConfig } from "../site/assets/runtime-config.js";

function makeRoot() {
  const values = new Map();
  return { values, style: { setProperty: (key, value) => values.set(key, value) } };
}

test("runtime configuration applies allowlisted theme and layout values", () => {
  const root = makeRoot();
  const applied = applyRuntimeConfig({
    schema_version: 1,
    themes: { light: { page_bg: "#ffffff", page_text: "#111111", font_family: "Arial, sans-serif" } },
    layout: { content_max_width: "1120px", header_min_height: "68px" }
  }, "light", root);

  assert.equal(applied, 5);
  assert.equal(root.values.get("--page-bg"), "#ffffff");
  assert.equal(root.values.get("--font-family"), "Arial, sans-serif");
  assert.equal(root.values.get("--content-max-width"), "1120px");
});

test("dark theme uses its own database tokens", () => {
  const root = makeRoot();
  applyRuntimeConfig({
    themes: { dark: { page_bg: "#111111", page_text: "#f5f5f5" } }
  }, "dark", root);

  assert.equal(root.values.get("--page-bg"), "#111111");
  assert.equal(root.values.get("--page-text"), "#f5f5f5");
});

test("unsafe values and unknown keys are ignored", () => {
  const root = makeRoot();
  const applied = applyRuntimeConfig({
    themes: { light: { page_bg: "url(https://bad.example/x)", unknown_token: "red" } },
    layout: { header_min_height: "12px;display:none" }
  }, "light", root);

  assert.equal(applied, 0);
  assert.equal(root.values.size, 0);
  assert.equal(isSafeRuntimeValue("page_bg", "expression(alert(1))"), false);
  assert.equal(isSafeRuntimeValue("header_min_height", "12px"), true);
});

test("invalid configuration input is a safe no-op", () => {
  assert.equal(applyRuntimeConfig(null, "light", makeRoot()), 0);
  assert.equal(applyRuntimeConfig({ themes: [] }, "light", makeRoot()), 0);
});

test("runtime config loader reads only the public runtime_config setting", async () => {
  const calls = [];
  const row = { schema_version: 1, themes: { light: { page_bg: "#fff" } } };
  const query = {
    select(value) { calls.push(["select", value]); return this; },
    eq(key, value) { calls.push(["eq", key, value]); return this; },
    maybeSingle() { return Promise.resolve({ data: { setting_value: row }, error: null }); }
  };
  const client = { from(table) { calls.push(["from", table]); return query; } };

  assert.equal(await loadRuntimeConfig(client), row);
  assert.deepEqual(calls, [
    ["from", "site_settings"],
    ["select", "setting_value"],
    ["eq", "setting_key", "runtime_config"],
    ["eq", "is_public", true]
  ]);
});

test("runtime config loader fails closed when setting is unavailable", async () => {
  const client = { from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error("offline") }) }) }) }) }) };
  assert.equal(await loadRuntimeConfig(client), null);
});


test("runtime theme colors reject non-monochrome values", () => {
  assert.equal(isSafeRuntimeValue("page_bg", "#ff0000"), false);
  assert.equal(isSafeRuntimeValue("page_bg", "#111111"), true);
});
