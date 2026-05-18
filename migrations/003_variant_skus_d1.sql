-- ============================================================
-- BlueBush Cloudflare D1 Migration: Variant SKUs
-- Includes conversion from PostgreSQL to SQLite/D1
-- ============================================================

-- Seed: Variant SKUs (from 003_variant_skus.sql)
INSERT INTO products (
  id, name, category, parent_id, variant_label,
  price_aud, stock_level, status,
  origin, weight_kg, eco_badge,
  marketing_hook, variant_description, variant_marketing_hook,
  variants, technical_specs, care_instructions, manual_excerpt
) VALUES
  ('BED-001-SAGE', 'Maireana French Flax Linen Sheet Set', 'Bedroom', 'BED-001', 'Sage',
   280, 9, 'In Stock',
   'Flax grown in France, sewn in Portugal', 2.5, 'Biodegradable',
   'Experience the effortless luxury of 100% pure French flax.', 'Our Maireana French Flax Linen Sheet Set in Sage brings the tranquillity of an Australian garden into your bedroom.', NULL,
   '["Sage"]', '["170 GSM heavyweight linen"]', '["Gentle machine wash cool"]', 'LINEN SHEDDING: Natural linen releases excess fibres.'),
  ('BED-001-OCHRE', 'Maireana French Flax Linen Sheet Set', 'Bedroom', 'BED-001', 'Ochre',
   280, 9, 'In Stock',
   'Flax grown in France, sewn in Portugal', 2.5, 'Biodegradable',
   'Experience the effortless luxury of 100% pure French flax.', 'The Ochre colourway of our Maireana French Flax Linen Sheet Set brings warm, golden earth tones to your bedroom sanctuary.', NULL,
   '["Ochre"]', '["170 GSM heavyweight linen"]', '["Gentle machine wash cool"]', 'LINEN SHEDDING: Natural linen releases excess fibres.'),
  ('BED-002-SAGE', 'Maireana Duvet Cover', 'Bedroom', 'BED-002', 'Sage',
   210, 8, 'In Stock',
   'Portugal', 1.8, 'Biodegradable',
   'Breathable linen duvet cover.', 'Our Maireana Duvet Cover in Sage features a coconut button closure.', NULL,
   '["Sage"]', '["170 GSM French Flax"]', '["Gentle cold machine wash"]', 'BUTTON CARE: Coconut buttons are natural.'),
  ('BATH-003-ROSE-GOLD', 'Safety Razor', 'Bathroom', 'BATH-003', 'Rose Gold',
   49.0, 34, 'In Stock',
   'Pakistan', 0.2, 'Zero Waste',
   'The ultimate plastic-free shave.', 'Our Rose Gold Safety Razor features an holiday knurled handle.', NULL,
   '["Rose Gold"]', '["Solid brass core"]', '["Rinse thoroughly after use"]', 'TECHNIQUE: Do not apply pressure.'),
  ('TECH-001-WHITE-STONE', 'Stone Ultrasonic Diffuser', 'Wellness Tech', 'TECH-001', 'White Stone',
   89, 20, 'In Stock',
   'China', 0.8, 'Energy Efficient',
   'Transform your home into a sanctuary.', 'Our Stone Ultrasonic Diffuser in White Stone is matte white.', NULL,
   '["White Stone"]', '["Capacity: 100ml"]', '["Wipe reservoir after use"]', 'TROUBLESHOOTING: Clean the oscillator disc.')
ON CONFLICT(id) DO UPDATE SET
  stock_level = EXCLUDED.stock_level,
  status = EXCLUDED.status,
  price_aud = EXCLUDED.price_aud;

-- Chatbot Training: Variant-Specific Q&A
INSERT INTO chatbot_training (question, answer, tags) VALUES
('What is the difference between the Silver, Rose Gold, and Matte Black safety razors?',
 'The Silver razor features a classic polished chrome brass handle ($45). The Rose Gold variant has an holiday knurled handle ($49). The Matte Black is a sleek powder-coated option ($42).',
 '["safety-razor", "variants", "BATH-003"]'),
('Which weighted blanket weight should I choose?',
 'For optimal benefit, choose a weight that is roughly 10% of your body weight. 5kg ($200), 7kg ($220), or 9kg ($250).',
 '["weighted-blanket", "sizing", "BED-006"]')
ON CONFLICT DO NOTHING;
