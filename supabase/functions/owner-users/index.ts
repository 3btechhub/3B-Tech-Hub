import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set(["https://3btechhub.github.io"]);
const allowedRoles = new Set(["admin", "member"]);
const primaryOwnerEmail = "3btechhub@gmail.com";
const redirectTo = "https://3btechhub.github.io/3btechhub/account/";

function response(body: unknown, status: number, origin: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "authorization, apikey, content-type, x-client-info";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function recordAudit(
  admin: ReturnType<typeof createClient>,
  actorId: string,
  action: string,
  resourceId: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    resource_type: "auth.users",
    resource_id: resourceId,
    metadata,
  });
  return error?.message || null;
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins.has(origin)) return response({ error: "Origin not allowed." }, 403, null);
  if (request.method === "OPTIONS") return response({ ok: true }, 200, origin);
  if (request.method !== "POST") return response({ error: "Method not allowed." }, 405, origin);

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return response({ error: "Authentication required." }, 401, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return response({ error: "Server configuration is incomplete." }, 503, origin);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    const actor = authData.user;
    if (authError || !actor) return response({ error: "Invalid session." }, 401, origin);

    const { data: ownerRole, error: ownerError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", actor.id)
      .eq("role", "owner")
      .maybeSingle();
    if (ownerError || !ownerRole) return response({ error: "Owner permission required." }, 403, origin);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || typeof body.action !== "string") {
      return response({ error: "Invalid request body." }, 400, origin);
    }

    if (body.action === "list") {
      const page = Math.max(1, Math.min(1000, Number.isInteger(body.page) ? body.page : 1));
      const perPage = Math.max(1, Math.min(50, Number.isInteger(body.perPage) ? body.perPage : 50));
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data.users || [];
      const ids = users.map((user) => user.id);
      const { data: roles, error: rolesError } = ids.length
        ? await admin.from("user_roles").select("user_id,role").in("user_id", ids)
        : { data: [], error: null };
      if (rolesError) throw rolesError;
      const roleByUser = new Map((roles || []).map((row) => [row.user_id, row.role]));
      return response({
        users: users.map((user) => ({
          id: user.id,
          email: user.email || "",
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          banned_until: user.banned_until,
          role: roleByUser.get(user.id) || "member",
        })),
        page,
        perPage,
        total: data.total ?? users.length,
      }, 200, origin);
    }

    if (body.action === "invite") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const role = typeof body.role === "string" ? body.role : "member";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response({ error: "Enter a valid email address." }, 400, origin);
      if (email === primaryOwnerEmail || !allowedRoles.has(role)) return response({ error: "This role or account cannot be invited." }, 400, origin);
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) throw error;
      if (!data.user) throw new Error("Invite did not return a user.");
      const { error: roleInsertError } = await admin.from("user_roles").insert({
        user_id: data.user.id,
        role,
        created_by: actor.id,
      });
      if (roleInsertError) throw roleInsertError;
      const auditWarning = await recordAudit(admin, actor.id, "user_invited", data.user.id, { role });
      return response({ invited: true, user: { id: data.user.id, email: data.user.email, role }, auditWarning }, 201, origin);
    }

    if (body.action === "set-role") {
      if (!validUuid(body.userId) || typeof body.role !== "string" || !allowedRoles.has(body.role)) {
        return response({ error: "Invalid user or role." }, 400, origin);
      }
      const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(body.userId);
      if (targetError || !targetData.user) return response({ error: "User not found." }, 404, origin);
      if ((targetData.user.email || "").toLowerCase() === primaryOwnerEmail) {
        return response({ error: "The primary Owner account is protected." }, 403, origin);
      }
      const { error: deleteError } = await admin.from("user_roles").delete().eq("user_id", body.userId).neq("role", "owner");
      if (deleteError) throw deleteError;
      const { error: insertError } = await admin.from("user_roles").insert({
        user_id: body.userId,
        role: body.role,
        created_by: actor.id,
      });
      if (insertError) throw insertError;
      const auditWarning = await recordAudit(admin, actor.id, "user_role_changed", body.userId, { role: body.role });
      return response({ updated: true, userId: body.userId, role: body.role, auditWarning }, 200, origin);
    }

    if (body.action === "set-status") {
      if (!validUuid(body.userId) || typeof body.blocked !== "boolean") {
        return response({ error: "Invalid user status request." }, 400, origin);
      }
      const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(body.userId);
      if (targetError || !targetData.user) return response({ error: "User not found." }, 404, origin);
      if ((targetData.user.email || "").toLowerCase() === primaryOwnerEmail) {
        return response({ error: "The primary Owner account cannot be blocked." }, 403, origin);
      }
      const { error } = await admin.auth.admin.updateUserById(body.userId, {
        ban_duration: body.blocked ? "876000h" : "none",
      });
      if (error) throw error;
      const auditWarning = await recordAudit(admin, actor.id, body.blocked ? "user_blocked" : "user_unblocked", body.userId);
      return response({ updated: true, userId: body.userId, blocked: body.blocked, auditWarning }, 200, origin);
    }

    if (body.action === "reset-password") {
      if (!validUuid(body.userId)) return response({ error: "Invalid user." }, 400, origin);
      const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(body.userId);
      if (targetError || !targetData.user?.email) return response({ error: "User not found." }, 404, origin);
      if (targetData.user.email.toLowerCase() === primaryOwnerEmail) {
        return response({ error: "Use the primary Owner's own account recovery flow." }, 403, origin);
      }
      const { error } = await admin.auth.resetPasswordForEmail(targetData.user.email, { redirectTo });
      if (error) throw error;
      const auditWarning = await recordAudit(admin, actor.id, "password_reset_requested", body.userId);
      return response({ sent: true, auditWarning }, 200, origin);
    }

    return response({ error: "Unsupported action." }, 400, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return response({ error: message }, 400, origin);
  }
});
