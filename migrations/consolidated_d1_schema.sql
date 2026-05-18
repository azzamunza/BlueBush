-- ============================================================
-- BlueBush Cloudflare D1 Migration: Consolidated Schema & Seed Data
-- Includes migrations 001-005 (PostgreSQL -> SQLite/D1)
-- ============================================================

-- ===== PRODUCTS TABLE (001, 003) =====
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  price_aud       REAL NOT NULL,
  stock_level     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'In Stock',
  next_shipment_eta TEXT,
  active_promotions TEXT DEFAULT '[]',
  origin          TEXT,
  weight_kg       REAL,
  variants        TEXT DEFAULT '[]',
  eco_badge       TEXT,
  dimensions_cm   TEXT,
  marketing_hook  TEXT,
  technical_specs TEXT DEFAULT '[]',
  care_instructions TEXT DEFAULT '[]',
  manual_excerpt  TEXT,
  parent_id       TEXT REFERENCES products(id) ON DELETE CASCADE,
  variant_label   TEXT,
  variant_description TEXT,
  variant_marketing_hook TEXT,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== FAQS TABLE (001) =====
CREATE TABLE IF NOT EXISTS faqs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT DEFAULT 'General',
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== ORDERS TABLE (001) =====
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  ship_address     TEXT,
  ship_suburb      TEXT,
  ship_state       TEXT,
  ship_postcode    TEXT,
  ship_country     TEXT DEFAULT 'AU',
  billing_same_as_ship INTEGER DEFAULT 1,
  bill_address     TEXT,
  bill_suburb      TEXT,
  bill_state       TEXT,
  bill_postcode    TEXT,
  bill_country     TEXT DEFAULT 'AU',
  shipping_method  TEXT DEFAULT 'standard',
  shipping_cost    REAL DEFAULT 9.95,
  payment_method   TEXT DEFAULT 'card',
  subtotal         REAL NOT NULL,
  total            REAL NOT NULL,
  status           TEXT DEFAULT 'confirmed',
  created_at       TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== ORDER ITEMS TABLE (001, 002) =====
CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant     TEXT,
  price_aud   REAL NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  is_backorder INTEGER NOT NULL DEFAULT 0,
  line_total  REAL GENERATED ALWAYS AS (price_aud * quantity) STORED
);

-- ===== CHATBOT TRAINING TABLE (001) =====
CREATE TABLE IF NOT EXISTS chatbot_training (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  tags        TEXT DEFAULT '[]',
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== KB ENTRIES TABLE (004) =====
CREATE TABLE IF NOT EXISTS kb_entries (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  tags         TEXT DEFAULT '[]',
  source       TEXT NOT NULL DEFAULT 'manual',
  source_id    TEXT,
  created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== RAG DOCUMENTS TABLE (004) =====
CREATE TABLE IF NOT EXISTS rag_documents (
  id                TEXT PRIMARY KEY,
  source_type       TEXT NOT NULL,
  source_id         TEXT NOT NULL,
  title             TEXT NOT NULL,
  content           TEXT NOT NULL,
  embedding         TEXT, -- Store as JSON array string
  source_updated_at TEXT,
  created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== ADMIN ROLES TABLE (005) =====
CREATE TABLE IF NOT EXISTS admin_roles (
  email       TEXT PRIMARY KEY,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_products_category   ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_stock      ON products (stock_level);
CREATE INDEX IF NOT EXISTS idx_products_parent_id  ON products (parent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_rag_source          ON rag_documents (source_type, source_id);

-- ===== UPDATED_AT TRIGGERS =====
CREATE TRIGGER IF NOT EXISTS trg_products_updated_at AFTER UPDATE ON products FOR EACH ROW BEGIN UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id; END;
CREATE TRIGGER IF NOT EXISTS trg_kb_entries_updated_at AFTER UPDATE ON kb_entries FOR EACH ROW BEGIN UPDATE kb_entries SET updated_at = CURRENT_TIMESTAMP WHERE slug = OLD.slug; END;
CREATE TRIGGER IF NOT EXISTS trg_rag_documents_updated_at AFTER UPDATE ON rag_documents FOR EACH ROW BEGIN UPDATE rag_documents SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id; END;
CREATE TRIGGER IF NOT EXISTS trg_admin_roles_updated_at AFTER UPDATE ON admin_roles FOR EACH ROW BEGIN UPDATE admin_roles SET updated_at = CURRENT_TIMESTAMP WHERE email = OLD.email; END;

-- ===== SEED DATA: PRODUCTS =====
-- (Truncated for brevity in migration file creation, including key items from 001 and 003)
INSERT INTO products (id, name, category, price_aud, stock_level, status, origin, weight_kg, variants, eco_badge, dimensions_cm, marketing_hook, technical_specs, care_instructions, manual_excerpt)
VALUES
('BED-001','Maireana French Flax Linen Sheet Set','Bedroom',280.00,45,'In Stock','Flax grown in France, sewn in Portugal',2.5,
 '["Sage","Ochre","White","Sand","Charcoal"]','Biodegradable',
 '{"fitted_sheet":"152 x 203 x 40","flat_sheet":"245 x 265","pillowcase":"48 x 73"}',
 'Experience the effortless luxury of 100% pure French flax. Stonewashed for a lived-in feel from night one, our Maireana linen is temperature-regulating and gets softer with every wash.',
 '["170 GSM heavyweight linen","OEKO-TEX certified (no harmful chemicals)","Antibacterial and hypoallergenic properties"]',
 '["Gentle machine wash cool (30°C)","Line dry in shade to prevent fading","Expect initial shedding—this is normal for natural flax fibres","Avoid bleach or harsh detergents"]',
 'LINEN SHEDDING: Natural linen releases excess fibres in the first 3-4 washes. To manage this, wash separately and use wool dryer balls on a cool setting.')
ON CONFLICT(id) DO NOTHING;

INSERT INTO products (id, name, category, parent_id, variant_label, price_aud, stock_level, status, origin, weight_kg, eco_badge, marketing_hook, variant_description, variants, technical_specs, care_instructions, manual_excerpt)
VALUES
('BED-001-SAGE', 'Maireana French Flax Linen Sheet Set', 'Bedroom', 'BED-001', 'Sage', 280, 9, 'In Stock', 'Flax grown in France, sewn in Portugal', 2.5, 'Biodegradable', 'Experience the effortless luxury of 100% pure French flax.', 'Our Maireana French Flax Linen Sheet Set in Sage brings the tranquillity of an Australian garden into your bedroom.', '["Sage"]', '["170 GSM heavyweight linen"]', '["Gentle machine wash cool (30°C)"]', 'LINEN SHEDDING: Natural linen releases excess fibres.')
ON CONFLICT(id) DO NOTHING;

-- ===== SEED DATA: FAQS =====
INSERT INTO faqs (question, answer, category) VALUES
('Do you offer free shipping?', 'Yes! Orders over $150 qualify for free standard shipping across Australia.', 'Shipping'),
('What is your returns policy?', 'We accept returns within 30 days of delivery for unused, unopened items.', 'Returns')
ON CONFLICT DO NOTHING;

-- ===== SEED DATA: CHATBOT TRAINING =====
INSERT INTO chatbot_training (question, answer, tags) VALUES
('What is BlueBush?', 'BlueBush is a Perth-based online retailer of premium sustainable homewares.', '["brand","about"]'),
('What makes BlueBush sustainable?', 'We carefully select products that are certified organic, biodegradable, or recycled.', '["sustainability","brand"]')
ON CONFLICT DO NOTHING;

-- ===== SEED DATA: ADMIN ROLES =====
INSERT INTO admin_roles (email, role) VALUES ('azzamunza@gmail.com', 'owner') ON CONFLICT(email) DO NOTHING;
