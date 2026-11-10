import { z } from "zod";

const httpsUrl = z.url().refine((value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "Only secure HTTPS URLs are accepted.");

const videoEmbedUrl = httpsUrl.refine((value) => {
  const hostname = new URL(value).hostname.toLowerCase();
  return [
    "youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be",
    "vimeo.com", "www.vimeo.com", "player.vimeo.com",
  ].includes(hostname);
}, "Use an approved YouTube or Vimeo URL.");

const commonMediaFields = {
  title: z.string().trim().min(1).max(120),
  altText: z.string().trim().max(250).default(""),
  caption: z.string().trim().max(500).default(""),
  tags: z.array(z.string().trim().min(1).max(32)).max(20).default([]),
  visibility: z.enum(["public", "private"]).default("public"),
};

export const uploadedMediaSchema = z.object({
  ...commonMediaFields,
  sourceType: z.literal("appwrite"),
  storageBucketId: z.string().trim().min(1).max(64),
  storageFileId: z.string().trim().min(1).max(64),
  mediaType: z.enum(["image", "video", "document", "other"]),
  mimeType: z.string().trim().min(3).max(120),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024),
});

export const externalMediaSchema = z.object({
  ...commonMediaFields,
  sourceType: z.literal("external"),
  externalUrl: httpsUrl,
  mediaType: z.enum(["image", "video", "document"]),
});

export const videoEmbedSchema = z.object({
  ...commonMediaFields,
  sourceType: z.literal("video_embed"),
  externalUrl: videoEmbedUrl,
  mediaType: z.literal("video"),
  provider: z.enum(["youtube", "vimeo"]),
});

export const mediaAssetSchema = z.discriminatedUnion("sourceType", [
  uploadedMediaSchema,
  externalMediaSchema,
  videoEmbedSchema,
]);

export type MediaAssetInput = z.input<typeof mediaAssetSchema>;
export type MediaAsset = z.output<typeof mediaAssetSchema>;

export const MAX_MEDIA_UPLOAD_BYTES = 50 * 1024 * 1024;
export const allowedImageMimeTypes = [
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
] as const;
export const allowedVideoMimeTypes = [
  "video/mp4", "video/webm", "video/quicktime",
] as const;
export const allowedDocumentMimeTypes = [
  "application/pdf",
] as const;

export const mediaMetadataUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  altText: z.string().trim().max(250).optional(),
  caption: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(20).optional(),
  visibility: z.enum(["public", "private"]).optional(),
  externalUrl: httpsUrl.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one metadata field is required.");
