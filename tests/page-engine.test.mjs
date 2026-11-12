import test from "node:test";
import assert from "node:assert/strict";
import { isRegisteredComponent } from "../site/assets/page-engine.js";

test("only trusted component types are registered", () => {
  for (const type of ["hero","rich_text","image","card_grid","button_group","faq","spacer"]) assert.equal(isRegisteredComponent(type), true);
  for (const type of ["script","html","iframe","sql","javascript"]) assert.equal(isRegisteredComponent(type), false);
});
