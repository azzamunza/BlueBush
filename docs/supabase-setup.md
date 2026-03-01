# Supabase Configuration — BlueBush

This document explains how to connect the BlueBush static site to your Supabase project for local development and for GitHub Pages deployment.

---

## Architecture Overview

```
Browser
  └── js/env.js          ← Supabase URL + anon key (configured per environment)
  └── @supabase/supabase-js (CDN)
  └── js/supabaseClient.js  ← wrapper: fetchProducts, fetchFaqs, placeOrder RPC
```

Only the **anon (public) key** is used on the client side. Row Level Security (RLS) policies ensure that:
- Products and FAQs are publicly readable (anon `SELECT`)
- Orders can only be inserted (anon `INSERT`)
- Stock decrements and order creation are handled atomically by the `place_order` RPC function (defined with `SECURITY DEFINER`)

**Never commit or expose your Supabase service role key in client-side code.**

---

## Step 1 — Create a Supabase Project

1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your:
   - **Project URL**: `https://<project-id>.supabase.co`
   - **Anon public key**: found in *Settings → API → anon public*

---

## Step 2 — Run Migrations

Apply the database migrations in order:

```bash
# Set your Supabase connection string (found in Settings → Database → Connection string → URI)
export SUPABASE_DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"

psql "$SUPABASE_DB_URL" -f migrations/001_initial_schema.sql
psql "$SUPABASE_DB_URL" -f migrations/002_rpc_and_indexes.sql
```

Or via the GitHub Action (automatically runs on push to `main` when migration files change):
- Ensure the `SUPABASE_DB_URL` secret is set in your repository secrets (*Settings → Secrets → Actions*)

---

## Step 3 — Configure Credentials

### Local Development

Edit `js/env.js` and replace the placeholder values:

```js
window.SUPABASE_URL      = 'https://your-project-id.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Important**: `js/env.js` is committed to the repository with placeholder values. Do not commit real credentials if your repository is public. For private repos it is acceptable to commit the anon key (it is a public key by design), but always keep the service role key out of source control.

### GitHub Pages Deployment

Since GitHub Pages serves files directly from the repository, the simplest approach is:

**Option A — Committed env.js with anon key (recommended for public demo sites)**

The Supabase anon key is intentionally a _public_ key. For a demo/portfolio site, it is acceptable to commit it to `js/env.js`. Protect your data using RLS policies (already configured in the migrations).

1. Edit `js/env.js` with your real URL and anon key
2. Commit and push — GitHub Pages will serve the updated file

**Option B — GitHub Actions build step (for stricter separation)**

Use a GitHub Actions workflow to inject credentials at deploy time:

```yaml
# .github/workflows/deploy.yml
- name: Inject Supabase config
  run: |
    sed -i "s|https://your-project-id.supabase.co|${{ secrets.SUPABASE_URL }}|g" js/env.js
    sed -i "s|your-anon-key-here|${{ secrets.SUPABASE_ANON_KEY }}|g" js/env.js
```

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in *Repository Settings → Secrets → Actions*.

---

## Step 4 — Verify the Connection

Open `shop.html` in your browser. If Supabase is correctly configured:
- Products will load from the `products` table (not `data/products.json`)
- The browser console will not show any Supabase warning messages

If Supabase is **not** configured (placeholder values in `env.js`), the site automatically falls back to:
- `data/products.json` for products
- Static HTML for FAQs
- Demo/local mode for checkout (no actual DB writes)

---

## Fallback Behaviour

| Feature | Supabase configured | Supabase not configured |
|---------|---------------------|------------------------|
| Products (home, shop, product pages) | Loaded from `products` table | Loaded from `data/products.json` |
| FAQs | Loaded from `faqs` table; replaces static HTML | Static HTML in `faq.html` shown |
| Checkout / Orders | Writes to `orders` + `order_items` via `place_order` RPC; decrements stock | Demo mode — order confirmed locally, no DB write |
| Stock levels | Live from Supabase | From `data/products.json` (static) |

---

## RLS Policies Summary

| Table | anon SELECT | anon INSERT | anon UPDATE | anon DELETE |
|-------|:-----------:|:-----------:|:-----------:|:-----------:|
| `products` | ✅ | ❌ | ❌ | ❌ |
| `faqs` | ✅ | ❌ | ❌ | ❌ |
| `orders` | ❌ | ✅ (via RPC) | ❌ | ❌ |
| `order_items` | ❌ | ✅ (via RPC) | ❌ | ❌ |
| `chatbot_training` | ✅ | ❌ | ❌ | ❌ |

Stock decrements are performed inside `place_order` which is `SECURITY DEFINER` — the function runs with elevated privileges internally, but is callable by anon. This prevents clients from directly modifying the `products` table.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Products not loading, console shows "Supabase JS library not loaded" | CDN script failed to load | Check network / ad blocker; ensure `<script src="https://cdn.jsdelivr.net/...">` loads |
| "your-project-id" still shown in console | `env.js` not updated | Edit `js/env.js` with real values |
| 404 on RPC call | Migration 002 not run | Run `psql $SUPABASE_DB_URL -f migrations/002_rpc_and_indexes.sql` |
| FAQs still showing static content | Supabase `faqs` table empty | Run migration 001 seed section or insert FAQ rows manually |
| CORS errors | Project URL mismatch | Ensure `window.SUPABASE_URL` matches exactly the URL in your Supabase project settings |
