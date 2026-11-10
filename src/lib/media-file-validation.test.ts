import { describe, expect, it } from "vitest";
import { matchesMediaSignature } from "./media-file-validation";

describe("media file signature validation", () => {
  it("accepts matching JPEG, PNG, GIF and PDF signatures", () => {
    expect(matchesMediaSignature(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg")).toBe(true);
    expect(matchesMediaSignature(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe(true);
    expect(matchesMediaSignature(Uint8Array.from([0x47, 0x49, 0x46, 0x38]), "image/gif")).toBe(true);
    expect(matchesMediaSignature(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]), "application/pdf")).toBe(true);
  });

  it("rejects MIME spoofing and unknown file types", () => {
    expect(matchesMediaSignature(Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d]), "image/jpeg")).toBe(false);
    expect(matchesMediaSignature(Uint8Array.from([0, 0, 0, 0]), "application/octet-stream")).toBe(false);
  });

  it("accepts WebP and MP4 container markers", () => {
    expect(matchesMediaSignature(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]), "image/webp")).toBe(true);
    expect(matchesMediaSignature(Uint8Array.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70]), "video/mp4")).toBe(true);
  });
});
