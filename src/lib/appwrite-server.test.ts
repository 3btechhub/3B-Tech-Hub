import { describe, expect, it } from "vitest";
import { buildAppwriteRowQueries } from "./appwrite-server";

describe("buildAppwriteRowQueries", () => {
  it("bounds pagination values and searches media titles", () => {
    expect(buildAppwriteRowQueries(24, 48, "hero")).toEqual([
      "limit(24)",
      "offset(48)",
      'search("title","hero")',
    ]);
  });

  it("filters trashed media before calculating paginated results", () => {
    expect(buildAppwriteRowQueries(24, 0, undefined, true)).toEqual([
      "limit(24)",
      "offset(0)",
      'isNull("deletedAt")',
    ]);
  });

  it("clamps untrusted pagination inputs", () => {
    expect(buildAppwriteRowQueries(1000, -4)).toEqual([
      "limit(100)",
      "offset(0)",
    ]);
  });
});
