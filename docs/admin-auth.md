# Admin Authentication & Authorisation — BlueBush

This document explains how to configure and deploy the Supabase Google OAuth
login flow for the BlueBush Admin Dashboard, and the companion Cloudflare Worker
that validates sessions server-side.

---

## Architecture Overview

```
Browser (admin.html)
  │  loads js/admin-auth.js
  │  calls supabase.auth.signInWithOAuth({ provider: 'google' })
  ▼
Google Consent Screen
  │  redirects back to admin.html with PKCE code
  ▼
js/admin-auth.js (PKCE exchange handled by Supabase JS client)
  │  calls admin_roles table to check allowlist
  ▼
Admin App shown (or "Access denied" error)

Cloudflare Worker (bluebush-admin-api)
  POST /api/admin/validate-session
  │  Authorization: Bearer <supabase_access_token>
  │  validates token via Supabase /auth/v1/user
  │  looks up role in admin_roles table (service-role key)
  ▼
  { valid: true, email, role }  or  { valid: false, error }
```

---

## Step 1 — Supabase: Enable Google OAuth Provider

1. Go to **Authentication → Providers → Google** in your Supabase project dashboard.
2. Enable the **Google** provider.
3. Create a Google Cloud OAuth 2.0 Client ID (type: _Web application_).
   - **Authorised JavaScript origins**: `https://azzamunza.github.io`
   - **Authorised redirect URIs**: `https://<project-id>.supabase.co/auth/v1/callback`
4. Paste the Client ID and Client Secret into Supabase and save.
5. Under **Authentication → URL Configuration**, add your admin page URL to **Redirect URLs**:
   - `https://azzamunza.github.io/BlueBush/admin.html`

---

## Step 2 — Supabase: Run the admin_roles Migration

```bash
psql $SUPABASE_DB_URL -f migrations/005_admin_roles.sql
```

This creates the `admin_roles` table with Row-Level Security and pre-seeds
`azzamunza@gmail.com` as the `owner`.

### Role definitions

| Role    | Description                              |
|---------|------------------------------------------|
| owner   | Full access. Currently: azzamunza@gmail.com |
| admin   | Full access except owner-only operations |
| staff   | Read + limited write access              |
| viewer  | Read-only dashboards                     |

### Adding accounts

```sql
INSERT INTO admin_roles (email, role)
  VALUES ('colleague@example.com', 'admin');
```

---

## Step 3 — Deploy the Cloudflare Worker

The reference worker is at `cloudflare/bluebush-admin-api.js`.

1. Copy the file contents into a new Cloudflare Worker (e.g. `bluebush-admin-api`).
2. Set the following **Environment Variables / Secrets**:

   | Name                     | Type   | Value                                  |
   |--------------------------|--------|----------------------------------------|
   | `SUPABASE_URL`           | Text   | `https://<project-id>.supabase.co`     |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret | Your Supabase service-role key       |
   | `ALLOWED_ORIGINS`        | Text   | `https://azzamunza.github.io`          |

3. Deploy. The worker exposes:
   - `POST https://bluebush-admin-api.<account>.workers.dev/api/admin/validate-session`

---

## Step 4 — Frontend Configuration

The admin page reads `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` from
`js/env.js` (already configured with the BlueBush project values).

No additional configuration is required for local development as long as
`js/env.js` is present.

---

## How the Login Flow Works

1. User visits `admin.html` — the page loads but stays on the login screen.
2. `js/admin-auth.js` calls `supabase.auth.getSession()`:
   - If an unexpired session exists in `localStorage`, the user is validated
     against `admin_roles` and the admin app is shown immediately.
   - If not, the login screen is shown.
3. User clicks **Sign in with Google** → `bbAdminAuth.handleGoogleLogin()` is called:
   - Supabase initiates a PKCE OAuth flow and redirects the browser to Google.
4. After Google consent, the browser is redirected back to `admin.html` with a
   `code` parameter. Supabase JS automatically exchanges it for a session.
5. The `onAuthStateChange` listener fires with `SIGNED_IN` → `_handleSession()`
   checks `admin_roles` and shows the app (or an error if not allowlisted).

---

## GitHub API (Product Writes)

Writing product data and images still uses the GitHub Contents API, which
requires a Personal Access Token. This PAT is **separate** from the admin login:

1. After logging in, navigate to **Settings**.
2. Enter your GitHub PAT in the _GitHub Personal Access Token_ field and click
   **Save Token**. The token is stored in `sessionStorage` as `bb_admin_token`.

The login credential (Google OAuth) and the write credential (GitHub PAT) are
intentionally decoupled so that `viewer`/`staff` roles can be granted without
sharing the PAT.

---

## Security Notes

- The Supabase **anon key** in `js/env.js` is a public key by design and safe
  to commit to a public repository. It only allows access governed by RLS policies.
- The Supabase **service-role key** bypasses RLS and must **never** be exposed
  client-side. It is only used in the Cloudflare Worker.
- The `admin_roles` table has RLS enabled: authenticated users can only read
  their own row. The worker uses the service-role key to read any row.
- GitHub PATs are stored in `sessionStorage` only (cleared on tab close).
