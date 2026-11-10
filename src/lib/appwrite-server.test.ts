import { describe, expect, it } from "vitest";
import { buildAppwriteRowQueries } from "./appwrite-server";

describe("buildAppwriteRowQueries", () => {
  it("bounds pagination values and searches media titles", () => {
    expect(buildAppwriteRowQueries(24, 48, "hero")).toEqual([
      '{"method":"limit","values":[24]}',
      '{"method":"offset","values":[48]}',
      '{"method":"search","attribute":"title","values":["hero"]}',
    ]);
  });

  it("filters trashed media before calculating paginated results", () => {
    expect(buildAppwriteRowQueries(24, 0, undefined, true)).toEqual([
      '{"method":"limit","values":[24]}',
      '{"method":"offset","values":[0]}',
      '{"method":"isNull","attribute":"deletedAt"}',
    ]);
  });

  it("clamps untrusted pagination inputs", () => {
    expect(buildAppwriteRowQueries(1000, -4)).toEqual([
      '{"method":"limit","values":[100]}',
      '{"method":"offset","values":[0]}',
    ]);
  });

  it("trims and bounds untrusted search terms", () => {
    expect(buildAppwriteRowQueries(10, 0, "  hero  ")).toContain(
      '{"method":"search","attribute":"title","values":["hero"]}',
    );
    expect(buildAppwriteRowQueries(10, 0, "x".repeat(100))[2]).toContain("x".repeat(80));
  });
});
