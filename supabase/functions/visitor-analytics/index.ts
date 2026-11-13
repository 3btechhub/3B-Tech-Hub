import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set(["https://3btechhub.github.io"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: unknown, status: number, origin: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "apikey, authorization, content-type, x-client-info";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function publicIp(value: string | null): string | null {
  if (!value) return null;
  const ip = value.trim().replace(/^\[|\]$/g, "");
  if (!ip || ip.length > 64 || ip.includes("%")) return null;
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "localhost" || lower.startsWith("fc") ||
      lower.startsWith("fd") || lower.startsWith("fe80:") || lower.startsWith("::ffff:127.") ||
      lower.startsWith("::ffff:10.") || lower.startsWith("::ffff:192.168.")) return null;
  const parts = ip.split(".");
  if (parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)) {
    const [a, b] = parts.map(Number);
    if (a === 10 || a === 127 || a === 0 || a === 169 && b === 254 ||
        a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 ||
        a >= 224) return null;
    return ip;
  }
  if (ip.includes(":") && /^[0-9a-f:]+$/i.test(ip)) return ip;
  return null;
}

async function approximateLocation(ip: string | null): Promise<{ country: string | null; city: string | null }> {
  if (!ip) return { country: null, city: null };
  try {
    const response = await fetch("https://ipdata.free/" + encodeURIComponent(ip), {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return { country: null, city: null };
    const data = await response.json();
    const countryCode = typeof data.country === "string" ? data.country.trim().toUpperCase() : "";
    const country = /^[A-Z]{2}$/.test(countryCode)
      ? new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode
      : null;
    return {
      country: country ? country.slice(0, 120) : null,
      city: typeof data.city === "string" ? data.city.slice(0, 120) : null,
    };
  } catch {
    return { country: null, city: null };
  }
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed." }, 403, null);
  if (request.method === "OPTIONS") return json({ ok: true }, 200, origin);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server configuration is incomplete." }, 503, origin);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !uuidPattern.test(body.visitor_key || "") ||
      typeof body.page_path !== "string" || !body.page_path.startsWith("/") ||
      body.page_path.length > 400) {
    return json({ error: "Invalid analytics event." }, 400, origin);
  }

  const allowedValues = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "unknown";
  const pagePath = body.page_path.replace(/[\u0000-\u001f]/g, "").slice(0, 400);
  if (!pagePath.startsWith("/3btechhub/")) return json({ error: "Invalid page path." }, 400, origin);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Suppress duplicate route events from reloads within a short interval.
    const recentCutoff = new Date(Date.now() - 3000).toISOString();
    const { data: duplicate, error: duplicateError } = await admin
      .from("visitor_analytics")
      .select("id")
      .eq("visitor_key", body.visitor_key)
      .eq("page_path", pagePath)
      .gte("viewed_at", recentCutoff)
      .limit(1)
      .maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) return json({ recorded: true, duplicate: true }, 200, origin);

    // Reuse today's location for repeat visits; never persist or return the raw IP.
    const locationCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: previousVisit, error: previousError } = await admin
      .from("visitor_analytics")
      .select("country,city")
      .eq("visitor_key", body.visitor_key)
      .not("country", "is", null)
      .gte("viewed_at", locationCutoff)
      .order("viewed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (previousError) throw previousError;

    // Prefer the gateway-provided client IP; never persist it or return it.
    const forwarded = request.headers.get("x-forwarded-for");
    const forwardedCandidate = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).at(-1) || null;
    const clientIp = publicIp(forwardedCandidate || request.headers.get("x-real-ip"));
    const location = previousVisit?.country
      ? { country: previousVisit.country as string, city: (previousVisit.city as string | null) || null }
      : await approximateLocation(clientIp);

    const { error } = await admin.from("visitor_analytics").insert({
      visitor_key: body.visitor_key,
      page_path: pagePath,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : "",
      device: allowedValues(body.device, 40),
      operating_system: allowedValues(body.operating_system, 60),
      browser: allowedValues(body.browser, 60),
      country: location.country,
      city: location.city,
    });
    if (error) throw error;
    return json({ recorded: true, location_available: Boolean(location.country || location.city) }, 201, origin);
  } catch {
    return json({ error: "Could not record visitor analytics." }, 500, origin);
  }
});
