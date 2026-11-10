import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { allowedDocumentMimeTypes, allowedImageMimeTypes, allowedVideoMimeTypes, MAX_MEDIA_UPLOAD_BYTES } from "@/lib/media-schema";
import { createAppwriteRow, deleteAppwriteFile, isMediaStoreConfigured, uploadAppwriteFile } from "@/lib/appwrite-server";
export const runtime = "nodejs";

function matchesSignature(bytes: Uint8Array, mime: string) {
  const starts = (...signature: number[]) => signature.every((value, index) => bytes[index] === value);
  if (mime === "image/jpeg") return starts(0xff, 0xd8, 0xff);
  if (mime === "image/png") return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (mime === "image/gif") return starts(0x47, 0x49, 0x46, 0x38);
  if (mime === "image/webp") return starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (mime === "image/avif") return String.fromCharCode(...bytes.slice(4, 12)).includes("ftyp") && String.fromCharCode(...bytes.slice(8, 12)).includes("avif");
  if (mime === "application/pdf") return starts(0x25, 0x50, 0x44, 0x46, 0x2d);
  if (mime === "video/mp4" || mime === "video/quicktime") return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  if (mime === "video/webm") return starts(0x1a, 0x45, 0xdf, 0xa3);
  return false;
}
function mediaType(mime: string): "image" | "video" | "document" {
  return mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : "document";
}

export async function POST(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured()) return NextResponse.json({ error: "Media storage is not configured. No file was uploaded." }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file"); const title = form?.get("title"); const altText = form?.get("altText");
  if (!(file instanceof File) || typeof title !== "string" || typeof altText !== "string") return NextResponse.json({ error: "File, title and alt text are required." }, { status: 400 });
  if (file.size < 1 || file.size > MAX_MEDIA_UPLOAD_BYTES) return NextResponse.json({ error: "File must be between 1 byte and 50 MB." }, { status: 413 });
  const allowed: readonly string[] = [...allowedImageMimeTypes, ...allowedVideoMimeTypes, ...allowedDocumentMimeTypes];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "This file type is not allowed." }, { status: 415 });
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!matchesSignature(header, file.type)) return NextResponse.json({ error: "File content does not match its declared media type." }, { status: 415 });
  const assetId = randomUUID(); const bucketId = process.env.APPWRITE_MEDIA_BUCKET_ID!; let uploaded = false;
  try {
    await uploadAppwriteFile(bucketId, file, assetId); uploaded = true;
    await createAppwriteRow(process.env.APPWRITE_MEDIA_TABLE_ID!, assetId, {
      title: title.trim().slice(0, 120), altText: altText.trim().slice(0, 250), caption: "", tags: [], visibility: "public",
      sourceType: "appwrite", storageBucketId: bucketId, storageFileId: assetId, mediaType: mediaType(file.type),
      mimeType: file.type, fileSize: file.size, createdBy: auth.identity!.id, createdAt: new Date().toISOString(), deletedAt: null,
    });
    return NextResponse.json({ ok: true, assetId }, { status: 201 });
  } catch {
    if (uploaded) await deleteAppwriteFile(bucketId, assetId).catch(() => undefined);
    return NextResponse.json({ error: "Upload failed; any partial file was rolled back." }, { status: 502 });
  }
}
