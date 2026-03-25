-- ============================================================
-- BlueBush Supabase Migration: Admin Roles (Allowlist)
-- Run via: psql $SUPABASE_DB_URL -f migrations/005_admin_roles.sql
--
-- This table acts as an allowlist for the Admin Dashboard.
-- Only Google OAuth accounts whose email appears here can log in.
-- Roles: owner | admin | staff | viewer
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  email       TEXT PRIMARY KEY,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security: authenticated users can only read their own row.
-- The Cloudflare Worker uses the service-role key and bypasses RLS.
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_roles_read_own"
  ON admin_roles
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Seed: pre-approve the site owner.
INSERT INTO admin_roles (email, role)
  VALUES ('azzamunza@gmail.com', 'owner')
  ON CONFLICT (email) DO NOTHING;
