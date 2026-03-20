# RAG Pipeline — BlueBush

This document describes the end-to-end Retrieval-Augmented Generation (RAG)
pipeline for the BlueBush chatbot (Chloe). It covers new Supabase tables, the
Python indexing scripts, and how to update the Cloudflare Worker to retrieve
context before calling the NVIDIA chat model.

---

## Table of Contents

1. [What is RAG in this project?](#what-is-rag-in-this-project)
2. [New Supabase Tables and RPC](#new-supabase-tables-and-rpc)
3. [How `kb_entries` is generated and why](#how-kb_entries-is-generated-and-why)
4. [Running the scripts locally](#running-the-scripts-locally)
5. [Applying the migration](#applying-the-migration)
6. [Updating the Cloudflare Worker](#updating-the-cloudflare-worker)
7. [Operational notes](#operational-notes)

---

## What is RAG in this project?

Without RAG, Chloe's answers are based only on her system prompt (a static
text blob). She cannot look up accurate product prices, current stock levels,
or policies stored in Supabase — so she either guesses or admits she doesn't
know.

With RAG, every chat message triggers a three-step server-side pipeline:

```
User message
    │
    ▼
1. NVIDIA embeddings endpoint
   (converts message to a 2048-dim vector)
    │
    ▼
2. Supabase RPC match_rag_documents
   (vector similarity search → top-k document chunks)
    │
    ▼
3. Context injected into system prompt
   (Chloe reads the retrieved facts before answering)
    │
    ▼
4. NVIDIA chat completions (Llama3-ChatQA-1.5)
    │
    ▼
{ reply }  →  browser chatbot widget
```

The frontend contract is unchanged: `POST /api/chat` with `{ message }` still
returns `{ reply }`.

---

## New Supabase Tables and RPC

Migration file: `migrations/004_rag_pgvector_kb.sql`

### `kb_entries` — structured knowledge base

Stores factual, embeddable knowledge entries (policies, care guides, product
advice, FAQs) that are not suitable for storing in `chatbot_training`.

| Column | Type | Notes |
|---|---|---|
| `slug` | `text` PRIMARY KEY | Stable kebab-case ID, e.g. `gift-cards-overview` |
| `title` | `text` | Short title |
| `content` | `text` | Full factual text to embed |
| `tags` | `text[]` | Optional keyword tags |
| `source` | `text` | `'manual'`, `'faq'`, `'policy'`, etc. |
| `source_id` | `text` (nullable) | External reference ID |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto (trigger) |

**RLS**: Public (anon) `SELECT` is **allowed** by default so admin UIs and
potential public FAQ pages can read entries without a service key. Writes
require the service role key.

> **To lock `kb_entries` down to service role only**: run this SQL in the
> Supabase SQL editor:
> ```sql
> DROP POLICY IF EXISTS "kb_entries_public_read" ON kb_entries;
> ```

---

### `rag_documents` — vector store

One row per embeddable document. The `id` is a stable SHA-256 hash of
`(source_type, source_id)` so re-indexing the same source row is always an
upsert (no duplicates).

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PRIMARY KEY | SHA-256 hash (first 40 chars) |
| `source_type` | `text` | `'products'` or `'kb_entries'` |
| `source_id` | `text` | PK from source table |
| `title` | `text` | Document title |
| `content` | `text` | Embeddable text |
| `embedding` | `vector(2048)` | 2048-dim NVIDIA NemoRetriever vector |
| `source_updated_at` | `timestamptz` | Copied from source row |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto (trigger) |

**RLS**: `rag_documents` is **locked down** — no anon/public `SELECT` policy
exists. Only the Supabase service role key (which bypasses RLS by default) can
read this table.

**Index**: HNSW index with cosine distance operator class on `embedding`.

---

### `match_rag_documents` RPC

```sql
match_rag_documents(
  query_embedding  vector(2048),
  match_count      int     DEFAULT 5,
  source_filter    text    DEFAULT NULL
)
RETURNS TABLE (id, source_type, source_id, title, content, score float)
```

- `score` = `1 − cosine_distance` (higher = more similar, max 1.0).
- `source_filter`: if set, restrict results to that `source_type`
  (e.g. `'products'`).
- Execute is granted to `service_role` only. Anon cannot call this RPC.

---

## How `kb_entries` is generated and why

### Why a separate KB table?

The `chatbot_training` table contains example Q&A pairs. Embedding entire
chatbot conversations produces vectors that cluster around *dialogue patterns*
(greetings, tone), not around *facts* (prices, policies). RAG retrieval works
best when each chunk is a factual, self-contained statement.

`kb_entries` stores exactly that: short, factual, structured entries such as:

- "Gift cards are available in AUD $25/$50/$100/$200 denominations…"
- "Standard shipping is $9.95 flat rate Australia-wide…"
- "Shampoo bar transition period is up to 2 weeks…"

### Seed file

`kb/kb_seed.yml` is the source of truth for manually authored KB entries.
It ships with entries for:

- Gift cards (overview + refund policy)
- Shipping (standard, express, international)
- Returns and refunds policy
- Eco and sustainability credentials
- Handmade ceramics (wabi-sabi quality notes)
- Shampoo bar and deodorant transition guidance
- Linen care
- Solar products charging
- Bamboo in tropical climates
- Contact and support details
- Subscription cancellation

To add a new entry, append a block to `kb/kb_seed.yml` then re-run
`build_kb_entries.py`.

---

## Running the scripts locally

### 1. Install dependencies

```bash
cd /path/to/BlueBush
pip install -r scripts/requirements.txt
```

### 2. Set environment variables

```bash
export SUPABASE_URL="https://<project-id>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."   # service-role key — keep secret
export NVIDIA_API_KEY="nvapi-..."

# Optional overrides (defaults shown):
export NVIDIA_EMBEDDINGS_URL="https://integrate.api.nvidia.com/v1/embeddings"
export NVIDIA_EMBEDDINGS_MODEL="nvidia/llama-3_2-nemoretriever-300m-embed-v1"
```

> **Security**: Never commit your service role key or NVIDIA API key to source
> control. Use environment variables or a secrets manager.

### 3. Apply the migration (first time only)

See [Applying the migration](#applying-the-migration) below.

### 4. Build kb_entries

```bash
# Upsert seed file entries into Supabase kb_entries:
python scripts/build_kb_entries.py

# Also pull FAQs from Supabase faqs table and add them:
python scripts/build_kb_entries.py --include-faqs

# Dry run (print what would be upserted, no DB writes):
python scripts/build_kb_entries.py --dry-run
```

### 5. Index embeddings

```bash
# Full re-index (products + kb_entries):
python scripts/rag_index_supabase.py

# Index only products:
python scripts/rag_index_supabase.py --source products

# Index only kb_entries:
python scripts/rag_index_supabase.py --source kb_entries

# Test a query against existing rag_documents (no re-index):
python scripts/rag_index_supabase.py --test-query "do you sell gift cards?"
```

Expected output from `--test-query`:

```
Test query: "do you sell gift cards?"
Embedding query …
  Vector dimension: 2048
Calling match_rag_documents RPC …

  Top 5 results:
  [1] score=0.8421  [kb_entries/gift-cards-overview]  BlueBush Gift Cards — Overview
       BlueBush gift cards are available in digital format only. Denominations: AUD $25, $50, $100, $200 …
  [2] score=0.7914  [kb_entries/gift-cards-refund-policy]  BlueBush Gift Cards — Refund and Resale Policy
       Gift cards are non-refundable and cannot be resold or transferred for cash …
  ...
```

---

## Applying the migration

```bash
export SUPABASE_DB_URL="postgresql://postgres:<password>@<host>:5432/postgres"

# Run all migrations in order:
psql "$SUPABASE_DB_URL" -f migrations/001_initial_schema.sql
psql "$SUPABASE_DB_URL" -f migrations/002_rpc_and_indexes.sql
psql "$SUPABASE_DB_URL" -f migrations/003_variant_skus.sql
psql "$SUPABASE_DB_URL" -f migrations/004_rag_pgvector_kb.sql
```

Or via the GitHub Action: push to `main` when migration files change and ensure
`SUPABASE_DB_URL` is set in repository secrets. See `docs/supabase-setup.md`
for the full setup guide.

Migration 004 is idempotent — safe to run multiple times.

---

## Updating the Cloudflare Worker

The reference Worker script is stored at:

```
cloudflare/bluebush-chat-relay-rag.js
```

This is **not deployed automatically** from this repository. It is a reference
copy to be pasted into the Cloudflare Workers editor.

### Step 1 — Set new Worker secrets/variables

In the Cloudflare dashboard → Workers → `bluebush-chat-relay` →
Settings → Variables:

| Variable | Type | Value |
|---|---|---|
| `NVIDIA_EMBEDDINGS_URL` | Text | `https://integrate.api.nvidia.com/v1/embeddings` |
| `NVIDIA_EMBEDDINGS_MODEL` | Text | `nvidia/llama-3_2-nemoretriever-300m-embed-v1` |
| `SUPABASE_URL` | Text | `https://<project-id>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | your Supabase service-role key |

> The existing `PERSONAPLEX_URL`, `PERSONAPLEX_API_KEY`, and `ALLOWED_ORIGINS`
> variables remain unchanged.

### Step 2 — Paste the Worker code

1. Open Cloudflare Workers dashboard → `bluebush-chat-relay` → Edit code.
2. Replace the existing code with the contents of
   `cloudflare/bluebush-chat-relay-rag.js`.
3. Click **Save and Deploy**.

### Step 3 — Verify with curl

```bash
curl -s -X POST \
  https://bluebush-chat-relay.azzamunza.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://azzamunza.github.io" \
  -d '{"message": "Do you sell gift cards?"}' | jq .
```

Expected response shape (unchanged from base relay):

```json
{
  "reply": "Yes, BlueBush gift cards are available in AUD $25, $50, $100, and $200 denominations...",
  "conversationId": null
}
```

If RAG is working, Chloe's answer should accurately reference the facts from
`kb_entries` (denomination amounts, email delivery, etc.) rather than
hallucinating or saying she doesn't know.

---

## Operational notes

### When to re-run indexing

Re-run the indexing scripts whenever any of the following change:

| Changed data | Command |
|---|---|
| `kb/kb_seed.yml` entries | `build_kb_entries.py` then `rag_index_supabase.py --source kb_entries` |
| Product data in Supabase | `rag_index_supabase.py --source products` |
| FAQs in Supabase | `build_kb_entries.py --include-faqs` then `rag_index_supabase.py --source kb_entries` |
| Everything | `build_kb_entries.py --include-faqs && rag_index_supabase.py` |

Indexing is idempotent: re-running always upserts by `slug` / `id` — no
duplicates are created.

### Security

- **Never expose the `SUPABASE_SERVICE_ROLE_KEY` client-side.**
  It bypasses all RLS policies and has full database access.
  It must only exist in: Cloudflare Worker secrets, local `.env` files (git-ignored),
  and CI/CD secret stores.
- The `rag_documents` table is locked down — anon users cannot read it.
  Only `SECURITY DEFINER` RPCs (like `match_rag_documents`) and the service
  role key can access it.
- The `match_rag_documents` function is granted only to `service_role`, not to
  `anon` or `authenticated`.

### Performance

- The HNSW index (`m=16, ef_construction=128`) handles datasets of up to tens
  of thousands of documents with sub-millisecond search at query time.
- If the dataset grows beyond ~100k documents, consider increasing `m` and
  `ef_construction` values, or tune `ef_search` at query time.
- Embeddings are 2048-dimensional floats (≈8 KB per row). A 1000-document
  index occupies ≈8 MB in the vector column alone.

### Disabling RAG (fallback behaviour)

The Worker falls back gracefully to no-context chat if:
- `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is not set.
- The embeddings or RPC call fails for any reason.
- No results score above 0.3 cosine similarity.

In all fallback cases, `{ reply }` is still returned normally.
