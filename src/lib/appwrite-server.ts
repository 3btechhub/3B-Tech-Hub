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

export async function uploadAppwriteFile(bucketId: string, file: File, fileId: string) {
  const config = configuration();
  if (!config) throw new Error("APPWRITE_SERVER_CONFIGURATION_MISSING");
  const form = new FormData(); form.set("fileId", fileId); form.set("file", file, file.name);
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
