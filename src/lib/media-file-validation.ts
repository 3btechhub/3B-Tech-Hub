export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export function matchesMediaSignature(bytes: Uint8Array, mime: string) {

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
