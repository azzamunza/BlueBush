-- ============================================================
-- BlueBush Migration 004: RAG — pgvector, kb_entries, rag_documents
-- Run via: psql $SUPABASE_DB_URL -f migrations/004_rag_pgvector_kb.sql
-- Idempotent: safe to run multiple times.
--
-- Prerequisites:
--   • pgvector extension v0.8.0 (already installed in Supabase)
--   • Migrations 001, 002, 003 applied
-- ============================================================

-- ============================================================
-- 1. Enable vector extension (safe no-op if already enabled)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 2. Ensure updated_at trigger function exists
--    (repo already has set_updated_at from migration 001/002;
--     CREATE OR REPLACE makes this idempotent regardless)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. kb_entries — structured knowledge-base table
--
-- Stores factual, embeddable knowledge entries (gift cards,
-- policies, brand facts, how-tos) that are NOT suitable for
-- storing directly in the chatbot_training table.
--
-- RLS note: anon SELECT is ALLOWED so that future admin UIs /
-- public FAQ pages can read entries without a service key.
-- To lock it down to service role only, drop the policy named
-- "kb_entries_public_read" or change USING (true) to USING (false).
-- ============================================================
CREATE TABLE IF NOT EXISTS kb_entries (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  tags         TEXT[]        DEFAULT '{}',
  source       TEXT          NOT NULL DEFAULT 'manual',
  source_id    TEXT,
  created_at   TIMESTAMPTZ   DEFAULT now(),
  updated_at   TIMESTAMPTZ   DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_kb_entries_updated_at'
  ) THEN
    CREATE TRIGGER trg_kb_entries_updated_at
      BEFORE UPDATE ON kb_entries
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END
$$;

-- RLS — enable
ALTER TABLE kb_entries ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) read access.
-- To restrict to service role only: drop this policy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'kb_entries' AND policyname = 'kb_entries_public_read'
  ) THEN
    CREATE POLICY "kb_entries_public_read"
      ON kb_entries FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Writes require service role (no anon INSERT/UPDATE/DELETE policy).

-- ============================================================
-- 4. rag_documents — vector store
--
-- One row per embeddable document.  The id is a stable hash so
-- re-indexing the same source row is always an UPSERT (no dups).
--
-- source_type values: 'products' | 'kb_entries'
--
-- RLS: LOCKED DOWN — no anon/public SELECT.
-- Only the service role key (bypasses RLS) may read this table.
-- ============================================================
CREATE TABLE IF NOT EXISTS rag_documents (
  id                TEXT PRIMARY KEY,       -- sha256 hash of source_type + source_id
  source_type       TEXT NOT NULL,          -- 'products' | 'kb_entries'
  source_id         TEXT NOT NULL,
  title             TEXT NOT NULL,
  content           TEXT NOT NULL,
  embedding         vector(2048),
  source_updated_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   DEFAULT now(),
  updated_at        TIMESTAMPTZ   DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_rag_documents_updated_at'
  ) THEN
    CREATE TRIGGER trg_rag_documents_updated_at
      BEFORE UPDATE ON rag_documents
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END
$$;

-- Composite index for source lookups
CREATE INDEX IF NOT EXISTS idx_rag_source
  ON rag_documents (source_type, source_id);

-- HNSW index for cosine-distance similarity search
-- (ef_construction=128, m=16 are sensible defaults; tune after load test)
CREATE INDEX IF NOT EXISTS idx_rag_embedding_hnsw
  ON rag_documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 128);

-- RLS — LOCKED DOWN: no anon/public SELECT
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;

-- No permissive policies added → anon cannot read.
-- Service role always bypasses RLS (Supabase default behaviour).

-- ============================================================
-- 5. match_rag_documents RPC
--
-- Performs cosine-similarity search against rag_documents.
-- Callable ONLY via service role (no GRANT to anon).
--
-- Parameters:
--   query_embedding vector(2048) — embedded user query
--   match_count     int          — number of results (default 5)
--   source_filter   text         — if set, restrict to source_type
--
-- Returns table of (id, source_type, source_id, title, content, score)
-- where score = 1 − cosine_distance (higher = more similar).
-- ============================================================
CREATE OR REPLACE FUNCTION match_rag_documents(
  query_embedding  vector(2048),
  match_count      int     DEFAULT 5,
  source_filter    text    DEFAULT NULL
)
RETURNS TABLE (
  id          text,
  source_type text,
  source_id   text,
  title       text,
  content     text,
  score       float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    d.id,
    d.source_type,
    d.source_id,
    d.title,
    d.content,
    1 - (d.embedding <=> query_embedding) AS score
  FROM rag_documents d
  WHERE
    d.embedding IS NOT NULL
    AND (source_filter IS NULL OR d.source_type = source_filter)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Grant execute to service role only.
-- Anon callers cannot call this RPC.
REVOKE EXECUTE ON FUNCTION match_rag_documents(vector(2048), int, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION match_rag_documents(vector(2048), int, text) FROM anon;
GRANT  EXECUTE ON FUNCTION match_rag_documents(vector(2048), int, text) TO service_role;
