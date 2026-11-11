import test from "node:test";
import assert from "node:assert/strict";
import { filterProductsForRegion, getNextVisibleCount, PRODUCT_PAGE_SIZE } from "../site/assets/product-catalog.js";

const products = [
  { name: "Phone Glass Protector", category_group: "mobile", country: "bd" },
  { name: "Phone Case", category_group: "mobile", country: "saudi" },
  { name: "Satellite Dish", category_group: "satellite", country: "saudi" },
  { name: "Universal Cable", category_group: "mobile", country: null },
  { name: "Archived draft", category_group: "mobile", country: "bd", status: "draft" },
  null,
];

test("Bangladesh view filters country-specific products and keeps global products", () => {
  assert.deepEqual(filterProductsForRegion(products, "bd").map((item) => item.name), [
    "Phone Glass Protector", "Universal Cable", "Archived draft",
  ]);
});

test("Saudi view filters country-specific products and keeps global products", () => {
  assert.deepEqual(filterProductsForRegion(products, "saudi").map((item) => item.name), [
    "Phone Case", "Satellite Dish", "Universal Cable",
  ]);
});

test("Global view includes products from every country", () => {
  assert.equal(filterProductsForRegion(products, "global").length, 5);
});

test("invalid collection input returns an empty list", () => {
  assert.deepEqual(filterProductsForRegion(null, "global"), []);
});

test("More pagination starts with four and reveals the next four", () => {
  assert.equal(PRODUCT_PAGE_SIZE, 4);
  assert.equal(getNextVisibleCount(4, 9), 8);
  assert.equal(getNextVisibleCount(8, 9), 9);
  assert.equal(getNextVisibleCount(9, 9), 9);
});

test("pagination clamps invalid and negative values", () => {
  assert.equal(getNextVisibleCount(-5, 3, 4), 3);
  assert.equal(getNextVisibleCount(1, 5, -2), 2);
  assert.equal(getNextVisibleCount(Number.NaN, 6), 4);
});
