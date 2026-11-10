import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireOwnerApi } from "@/lib/admin-api-auth";
import { matchesMediaSignature } from "@/lib/media-file-validation";
import { allowedDocumentMimeTypes, allowedImageMimeTypes, allowedVideoMimeTypes, MAX_MEDIA_UPLOAD_BYTES } from "@/lib/media-schema";
import { createAppwriteRow, deleteAppwriteFile, deleteAppwriteRow, isMediaStoreConfigured, uploadAppwriteFile } from "@/lib/appwrite-server";
import { appendAuditEvent, isAuditStoreConfigured } from "@/lib/audit-store";

export const runtime = "nodejs";

function mediaType(mime: string): "image" | "video" | "document" {
  return mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : "document";
}

export async function POST(request: NextRequest) {
  const auth = await requireOwnerApi(request);
  if (auth.response) return auth.response;
  if (!isMediaStoreConfigured() || !isAuditStoreConfigured()) {
    return NextResponse.json({ error: "Media and audit storage must both be configured. No file was uploaded." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const title = form?.get("title");
  const altText = form?.get("altText");
  const requestedVisibility = form?.get("visibility");
  const visibility = requestedVisibility === "public" ? "public" : "private";
  if (!(file instanceof File) || typeof title !== "string" || typeof altText !== "string" || (requestedVisibility !== null && requestedVisibility !== "public" && requestedVisibility !== "private")) {
    return NextResponse.json({ error: "File, title and alt text are required." }, { status: 400 });
  }
  if (file.size < 1 || file.size > MAX_MEDIA_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 50 MB." }, { status: 413 });
  }

  const allowed: readonly string[] = [...allowedImageMimeTypes, ...allowedVideoMimeTypes, ...allowedDocumentMimeTypes];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "This file type is not allowed." }, { status: 415 });
  if (file.type.startsWith("image/") && file.size > 10_000_000) {
    return NextResponse.json({ error: "Images must be 10 MB or smaller to support Appwrite image transformations. Video and PDF files may be up to 50 MB." }, { status: 413 });
  }
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!matchesMediaSignature(header, file.type)) {
    return NextResponse.json({ error: "File content does not match its declared media type." }, { status: 415 });
  }

  const assetId = randomUUID();
  const bucketId = process.env.APPWRITE_MEDIA_BUCKET_ID!;
  const tableId = process.env.APPWRITE_MEDIA_TABLE_ID!;
  let uploaded = false;
  let rowCreated = false;

  try {
    const filePermissions = visibility === "public" ? ['read("any")'] : [];
    await uploadAppwriteFile(bucketId, file, assetId, filePermissions);
    uploaded = true;
    await createAppwriteRow(tableId, assetId, {
      title: title.trim().slice(0, 120),
      altText: altText.trim().slice(0, 250),
      caption: "",
      tags: [],
      visibility,
      sourceType: "appwrite",
      storageBucketId: bucketId,
      storageFileId: assetId,
      mediaType: mediaType(file.type),
      mimeType: file.type,
      fileSize: file.size,
      createdBy: auth.identity!.id,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    });
    rowCreated = true;
    await appendAuditEvent({
      actorId: auth.identity!.id,
      actorRole: "owner",
      action: "media.upload",
      targetType: "media",
      targetId: assetId,
      outcome: "success",
      metadata: { mediaType: mediaType(file.type), mimeType: file.type, fileSize: file.size, visibility },
      occurredAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, assetId }, { status: 201 });
  } catch {
    if (rowCreated) await deleteAppwriteRow(tableId, assetId).catch(() => undefined);
    if (uploaded) await deleteAppwriteFile(bucketId, assetId).catch(() => undefined);
    return NextResponse.json({ error: "Upload failed; any partial file was rolled back where possible." }, { status: 502 });
  }
}
