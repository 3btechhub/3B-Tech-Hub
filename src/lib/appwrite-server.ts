type AppwriteRow = { $id?: string; [key: string]: unknown };

function configuration() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace(/\/$/, "");
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!endpoint || !projectId || !apiKey) return null;
  return { endpoint, projectId, apiKey };
}

export function isContentStoreConfigured() {
  return Boolean(configuration() && process.env.APPWRITE_DATABASE_ID && process.env.APPWRITE_CONTENT_TABLE_ID);
}
export function isMediaStoreConfigured() {
  return Boolean(configuration() && process.env.APPWRITE_DATABASE_ID && process.env.APPWRITE_MEDIA_TABLE_ID && process.env.APPWRITE_MEDIA_BUCKET_ID);
}
export function isSettingsStoreConfigured() {
  return Boolean(configuration() && process.env.APPWRITE_DATABASE_ID && process.env.APPWRITE_SETTINGS_TABLE_ID);
}

async function appwriteRequest<T>(path: string, init: RequestInit): Promise<T> {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const response = await fetch(`${config.endpoint}${path}`, {
    ...init,
    headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey, ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("APPWRITE_REQUEST_FAILED");
  return response.json() as Promise<T>;
}

export async function createAppwriteRow(tableId: string, rowId: string, data: Record<string, unknown>) {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  if (!databaseId) throw new Error("APPWRITE_DATABASE_CONFIGURATION_MISSING");
  return appwriteRequest<AppwriteRow>(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows`, {
    method: "POST", body: JSON.stringify({ rowId, data, permissions: [] }),
  });
}

export async function uploadAppwriteFile(bucketId: string, file: File, fileId: string, permissions: string[] = []) {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const form = new FormData();
  form.set("fileId", fileId);
  form.set("file", file, file.name);
  for (const permission of permissions) form.append("permissions[]", permission);
  const response = await fetch(`${config.endpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files`, {
    method: "POST", headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey },
    body: form, cache: "no-store", signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error("APPWRITE_FILE_UPLOAD_FAILED");
  return response.json() as Promise<AppwriteRow>;
}

export async function deleteAppwriteFile(bucketId: string, fileId: string) {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const response = await fetch(`${config.endpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE", headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey },
    cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("APPWRITE_FILE_DELETE_FAILED");
}

export async function deleteAppwriteRow(tableId: string, rowId: string) {
  const config = configuration();
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  if (!config || !databaseId) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const response = await fetch(`${config.endpoint}/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows/${encodeURIComponent(rowId)}`, {
    method: "DELETE",
    headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("APPWRITE_ROW_DELETE_FAILED");
}

export function buildAppwriteRowQueries(limit = 100, offset = 0, search?: string, excludeDeleted = false) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const safeOffset = Math.min(Math.max(Math.trunc(offset), 0), 100000);
  const queries = [
    JSON.stringify({ method: "limit", values: [safeLimit] }),
    JSON.stringify({ method: "offset", values: [safeOffset] }),
  ];
  if (search?.trim()) {
    queries.push(JSON.stringify({
      method: "search",
      attribute: "title",
      values: [search.trim().slice(0, 80)],
    }));
  }
  if (excludeDeleted) {
    queries.push(JSON.stringify({ method: "isNull", attribute: "deletedAt" }));
  }
  return queries;
}

export async function listAppwriteRows(tableId: string, limit = 100, offset = 0, search?: string, excludeDeleted = false) {
  const config = configuration();
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  if (!config || !databaseId) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const params = new URLSearchParams();
  for (const query of buildAppwriteRowQueries(limit, offset, search, excludeDeleted)) params.append("queries[]", query);
  const result = await appwriteRequest<{ total: number; rows: AppwriteRow[] }>(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows?${params.toString()}`,
    { method: "GET" },
  );
  return {
    total: result.total ?? 0,
    rows: (result.rows ?? []).map((row) => ({
      ...(row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {}),
      $id: row.$id,
      $createdAt: row.$createdAt,
      $updatedAt: row.$updatedAt,
      $permissions: row.$permissions,
    })) as AppwriteRow[],
  };
}

export async function getAppwriteRow(tableId: string, rowId: string) {
  const config = configuration();
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  if (!config || !databaseId) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const row = await appwriteRequest<AppwriteRow>(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows/${encodeURIComponent(rowId)}`,
    { method: "GET" },
  );
  return {
    ...(row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {}),
    $id: row.$id,
    $createdAt: row.$createdAt,
    $updatedAt: row.$updatedAt,
    $permissions: row.$permissions,
  } as AppwriteRow;
}

export async function updateAppwriteRow(tableId: string, rowId: string, data: Record<string, unknown>) {
  const config = configuration();
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  if (!config || !databaseId) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  return appwriteRequest<AppwriteRow>(
    `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows/${encodeURIComponent(rowId)}`,
    { method: "PATCH", body: JSON.stringify({ data }) },
  );
}

export async function updateAppwriteFilePermissions(bucketId: string, fileId: string, permissions: string[]) {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const response = await fetch(`${config.endpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}`, {
    method: "PUT",
    headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ permissions }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("APPWRITE_FILE_PERMISSION_UPDATE_FAILED");
  return response.json() as Promise<AppwriteRow>;
}

export async function fetchAppwriteFilePreview(
  bucketId: string,
  fileId: string,
  options: { width?: number; height?: number; quality?: number; output?: "webp" | "avif" | "jpg" | "png" } = {},
) {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const query = new URLSearchParams();
  if (options.width) query.set("width", String(Math.min(Math.max(options.width, 1), 2000)));
  if (options.height) query.set("height", String(Math.min(Math.max(options.height, 1), 2000)));
  if (options.quality) query.set("quality", String(Math.min(Math.max(options.quality, 30), 90)));
  if (options.output) query.set("output", options.output);
  const suffix = query.size ? `?${query.toString()}` : "";
  const response = await fetch(`${config.endpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/preview${suffix}`, {
    method: "GET", headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey },
    cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  if (!response.ok || !response.body) throw new Error("APPWRITE_FILE_PREVIEW_FAILED");
  return response;
}

export async function fetchAppwriteFileView(bucketId: string, fileId: string) {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const response = await fetch(`${config.endpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/view`, {
    method: "GET", headers: { "X-Appwrite-Project": config.projectId, "X-Appwrite-Key": config.apiKey },
    cache: "no-store", signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || !response.body) throw new Error("APPWRITE_FILE_VIEW_FAILED");
  return response;
}
