import { describe, expect, it } from "vitest";
import { mediaAssetSchema, MAX_MEDIA_UPLOAD_BYTES } from "./media-schema";

const base = {
  title: "Homepage hero",
  altText: "Technician repairing a television",
  caption: "",
  tags: ["homepage", "hero"],
  visibility: "public" as const,
};

describe("mediaAssetSchema", () => {
  it("accepts managed Appwrite media metadata", () => {
    expect(mediaAssetSchema.safeParse({
      ...base,
      sourceType: "appwrite",
      storageBucketId: "public-media",
      storageFileId: "hero-image",
      mediaType: "image",
      mimeType: "image/webp",
      fileSize: 1024,
    }).success).toBe(true);
  });

  it("accepts secure external media URLs", () => {
    expect(mediaAssetSchema.safeParse({
      ...base,
      sourceType: "external",
      externalUrl: "https://cdn.example.com/hero.webp",
      mediaType: "image",
    }).success).toBe(true);
  });

  it("rejects insecure external URLs", () => {
    expect(mediaAssetSchema.safeParse({
      ...base,
      sourceType: "external",
      externalUrl: "http://cdn.example.com/hero.webp",
      mediaType: "image",
    }).success).toBe(false);
  });

  it("rejects unapproved video embed hosts", () => {
    expect(mediaAssetSchema.safeParse({
      ...base,
      sourceType: "video_embed",
      externalUrl: "https://random.example/embed/123",
      mediaType: "video",
      provider: "youtube",
    }).success).toBe(false);
  });

  it("rejects uploads larger than the configured limit", () => {
    expect(MAX_MEDIA_UPLOAD_BYTES).toBe(50 * 1024 * 1024);
    expect(mediaAssetSchema.safeParse({
      ...base,
      sourceType: "appwrite",
      storageBucketId: "public-media",
      storageFileId: "large-file",
      mediaType: "video",
      mimeType: "video/mp4",
      fileSize: MAX_MEDIA_UPLOAD_BYTES + 1,
    }).success).toBe(false);
  });
});
