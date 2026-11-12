import test from "node:test";
import assert from "node:assert/strict";
import { normalizedSegments } from "../site/assets/dynamic-page-router.js";

test("parses valid Main Page and Sub Page routes", () => {
  assert.deepEqual(normalizedSegments("/3btechhub/about-us/"), ["about-us"]);
  assert.deepEqual(normalizedSegments("/3btechhub/about-us/our-team/"), ["about-us", "our-team"]);
});

test("keeps reserved route segments for the router guard and rejects paths outside the site base", () => {
  assert.deepEqual(normalizedSegments("/3btechhub/"), []);
  assert.deepEqual(normalizedSegments("/3btechhub/dashboard/"), ["dashboard"]);
  assert.deepEqual(normalizedSegments("/another-site/about-us/"), []);
});

test("rejects malformed, encoded separator, invalid slug, and excessive-depth routes", () => {
  assert.deepEqual(normalizedSegments("/3btechhub/%E0%A4%A/"), []);
  assert.deepEqual(normalizedSegments("/3btechhub/about%2Fadmin/"), []);
  assert.deepEqual(normalizedSegments("/3btechhub/../login/"), []);
  assert.deepEqual(normalizedSegments("/3btechhub/about/team/member/"), []);
});
