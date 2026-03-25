/**
 * BlueBush Admin API — Cloudflare Worker
 * ─────────────────────────────────────────────────────────────────
 * File: cloudflare/bluebush-admin-api.js
 *
 * Provides authenticated admin endpoints that validate Supabase JWTs
 * and enforce role-based access via the admin_roles table.
 *
 * DO NOT deploy this file directly from this repository.
 * Copy-paste the contents into the Cloudflare Workers editor or your
 * wrangler project. See docs/admin-auth.md for deployment instructions.
 *
 * ─────────────────────────────────────────────────────────────────
 * Endpoints:
 *
 *   POST /api/admin/validate-session
 *     Validates the Bearer JWT from Supabase Auth, looks up the
 *     user's role in the admin_roles table, and returns:
 *       { valid: true, email, role }   — on success
 *       { valid: false, error }        — on failure (401 / 403)
 *
 * ─────────────────────────────────────────────────────────────────
 * Cloudflare Worker Variables / Secrets required:
 *
 *   SUPABASE_URL              (Text)    https://<project-id>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY (Secret)  Supabase service-role key
 *   ALLOWED_ORIGINS           (Text)    Comma-separated list of allowed origins
 *                                       e.g. "https://azzamunza.github.io"
 *
 * ─────────────────────────────────────────────────────────────────
 */

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function getAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  return getAllowedOrigins(env).includes(origin);
}

// ---------------------------------------------------------------------------
// Supabase JWT verification
// Validates the JWT against Supabase's /auth/v1/user endpoint (token introspection).
// This avoids needing to verify the JWT signature locally and ensures the
// token is still valid (not expired, not revoked).
// ---------------------------------------------------------------------------

/**
 * Validate a Supabase access token and return the user object.
 * Throws on invalid / expired tokens.
 * @param {string} accessToken
 * @param {object} env
 * @returns {Promise<{id: string, email: string}>}
 */
async function validateSupabaseToken(accessToken, env) {
  const supabaseUrl = env.SUPABASE_URL;
  if (!supabaseUrl) throw new Error("SUPABASE_URL not configured");

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("invalid_token");
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase auth error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const user = await res.json();
  if (!user || !user.email) throw new Error("invalid_token");
  return user;
}

// ---------------------------------------------------------------------------
// Role lookup
// Uses the service-role key to bypass RLS and read admin_roles.
// ---------------------------------------------------------------------------

/**
 * Look up the admin role for the given email address.
 * Returns the role string ('owner' | 'admin' | 'staff' | 'viewer') or null.
 * @param {string} email
 * @param {object} env
 * @returns {Promise<string|null>}
 */
async function lookupAdminRole(email, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/admin_roles?email=eq.${encodeURIComponent(email)}&select=role&limit=1`,
    {
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0].role || null;
}

// ---------------------------------------------------------------------------
// Route: POST /api/admin/validate-session
// ---------------------------------------------------------------------------

async function handleValidateSession(request, env, origin) {
  // Require Authorization: Bearer <supabase_access_token>
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return json(
      { valid: false, error: "Missing or malformed Authorization header" },
      401,
      corsHeaders(origin)
    );
  }
  const accessToken = match[1];

  let user;
  try {
    user = await validateSupabaseToken(accessToken, env);
  } catch (err) {
    const isInvalid = err.message === "invalid_token";
    return json(
      { valid: false, error: isInvalid ? "Invalid or expired session" : err.message },
      401,
      corsHeaders(origin)
    );
  }

  const role = await lookupAdminRole(user.email, env);
  if (!role) {
    return json(
      { valid: false, error: "Account not authorised for admin access" },
      403,
      corsHeaders(origin)
    );
  }

  return json(
    { valid: true, email: user.email, role },
    200,
    corsHeaders(origin)
  );
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // CORS preflight
    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(origin, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Origin check for all non-OPTIONS requests
    if (!isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed" }, 403);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json(
        { error: "Worker not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)" },
        500,
        corsHeaders(origin)
      );
    }

    // Route: POST /api/admin/validate-session
    if (url.pathname === "/api/admin/validate-session" && request.method === "POST") {
      return handleValidateSession(request, env, origin);
    }

    return new Response("Not Found", { status: 404 });
  },
};
