import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const builder = await readFile(new URL("../site/assets/page-builder.js", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261112094000_atomic_page_builder_revisions.sql", import.meta.url), "utf8");

test("Page Builder delegates revision capture and restore to database RPCs", () => {
  assert.match(builder, /rpc\(["']capture_page_revision["']/);
  assert.match(builder, /rpc\(["']restore_page_revision["']/);
  const restore = builder.slice(builder.indexOf("async function restoreRevision"), builder.indexOf("\n\n  root.innerHTML"));
  assert.doesNotMatch(restore, /\.from\(["']page_components["']\)\.(delete|insert|update)/);
});

test("component reordering is a single database RPC, not a sequence of client updates", () => {
  assert.match(builder, /rpc\(["']reorder_page_components["']/);
  const reorder = builder.slice(builder.indexOf("async function moveComponent"), builder.indexOf("async function toggleComponent"));
  assert.doesNotMatch(reorder, /\.from\(["']page_components["']\)\.update/);
});

test("revision database functions enforce admin access and lock the page", () => {
  for (const name of ["capture_page_revision", "restore_page_revision", "reorder_page_components"]) {
    assert.match(migration, new RegExp("create or replace function public\\." + name));
  }
  assert.equal((migration.match(/private\.is_site_admin\(\)/g) || []).length >= 3, true);
  assert.match(migration, /for update/);
  assert.match(migration, /security definer/);
  assert.match(migration, /revoke all on function public\.restore_page_revision/);
  assert.match(migration, /grant execute on function public\.restore_page_revision\(uuid\) to authenticated/);
});
