-- ============================================================
-- BlueBush Supabase Migration: Initial Schema & Seed Data
-- Run via: psql $SUPABASE_DB_URL -f migrations/001_initial_schema.sql
-- ============================================================

-- ===== PRODUCTS TABLE =====
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  price_aud       NUMERIC(10,2) NOT NULL,
  stock_level     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'In Stock',
  next_shipment_eta TEXT,
  active_promotions JSONB DEFAULT '[]'::jsonb,
  origin          TEXT,
  weight_kg       NUMERIC(6,3),
  variants        JSONB DEFAULT '[]'::jsonb,
  eco_badge       TEXT,
  dimensions_cm   JSONB,
  marketing_hook  TEXT,
  technical_specs JSONB DEFAULT '[]'::jsonb,
  care_instructions JSONB DEFAULT '[]'::jsonb,
  manual_excerpt  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===== FAQS TABLE =====
CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT DEFAULT 'General',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ===== ORDERS TABLE =====
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
  billing_same_as_ship BOOLEAN DEFAULT TRUE,
  bill_address     TEXT,
  bill_suburb      TEXT,
  bill_state       TEXT,
  bill_postcode    TEXT,
  bill_country     TEXT DEFAULT 'AU',
  shipping_method  TEXT DEFAULT 'standard',
  shipping_cost    NUMERIC(10,2) DEFAULT 9.95,
  payment_method   TEXT DEFAULT 'card',
  subtotal         NUMERIC(10,2) NOT NULL,
  total            NUMERIC(10,2) NOT NULL,
  status           TEXT DEFAULT 'confirmed',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ===== ORDER ITEMS TABLE =====
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant     TEXT,
  price_aud   NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  line_total  NUMERIC(10,2) GENERATED ALWAYS AS (price_aud * quantity) STORED
);

-- ===== CHATBOT TRAINING TABLE =====
CREATE TABLE IF NOT EXISTS chatbot_training (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ===== UPDATED_AT TRIGGER =====
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===== ROW LEVEL SECURITY =====
-- Products and FAQs are publicly readable; orders are write-only from backend.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_training ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) read access to products and FAQs
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "public_read_chatbot" ON chatbot_training FOR SELECT USING (true);

-- Allow anon to insert orders (fictitious checkout)
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);

-- ===== SEED: PRODUCTS =====
INSERT INTO products (id, name, category, price_aud, stock_level, status, origin, weight_kg, variants, eco_badge, dimensions_cm, marketing_hook, technical_specs, care_instructions, manual_excerpt)
VALUES

-- BEDROOM
('BED-001','Maireana French Flax Linen Sheet Set','Bedroom',280.00,45,'In Stock','Flax grown in France, sewn in Portugal',2.5,
 '["Sage","Ochre","White","Sand","Charcoal"]','Biodegradable',
 '{"fitted_sheet":"152 x 203 x 40","flat_sheet":"245 x 265","pillowcase":"48 x 73"}',
 'Experience the effortless luxury of 100% pure French flax. Stonewashed for a lived-in feel from night one, our Maireana linen is temperature-regulating and gets softer with every wash.',
 '["170 GSM heavyweight linen","OEKO-TEX certified (no harmful chemicals)","Antibacterial and hypoallergenic properties"]',
 '["Gentle machine wash cool (30°C)","Line dry in shade to prevent fading","Expect initial shedding—this is normal for natural flax fibres","Avoid bleach or harsh detergents"]',
 'LINEN SHEDDING: Natural linen releases excess fibres in the first 3-4 washes. To manage this, wash separately and use wool dryer balls on a cool setting.'),

('BED-002','Maireana Duvet Cover','Bedroom',210.00,32,'In Stock','Portugal',1.8,
 '["Sage","Ochre","White","Sand","Charcoal"]','Biodegradable',NULL,
 'Breathable linen duvet cover finished with natural coconut button closures and internal ties to keep your quilt perfectly in place.',
 '["170 GSM French Flax","Coconut button closures","Internal corner ties"]',
 '["Gentle cold machine wash","Line dry in shade"]',
 'BUTTON CARE: Coconut buttons are natural and durable, but avoid running them through heavy, hot tumble dry cycles to prevent cracking.'),

('BED-003','Bamboo Lyocell Quilt Insert','Bedroom',180.00,12,'In Stock','Ethically made in China (Closed Loop System)',3.0,
 '["Summer Weight","Winter Weight"]','Certified Organic',NULL,
 'Silky-soft bamboo lyocell fill that breathes beautifully. Naturally thermo-regulating, antimicrobial, and OEKO-TEX certified.',
 '["300 GSM (Summer) / 500 GSM (Winter)","OEKO-TEX Standard 100","Bamboo lyocell fill"]',
 '["Dry clean recommended","Air in shade between washes","Do not tumble dry on high heat"]',NULL),

('BED-004','Hemp Bed Runner','Bedroom',95.00,28,'In Stock','India',0.6,
 '["Natural","Olive"]','Biodegradable',NULL,
 'Add earthy texture to your bed with this natural hemp weave runner. Hard-wearing, naturally antibacterial, and gets better with age.',
 '["100% hemp","Natural undyed option available","50 x 200 cm"]',
 '["Machine wash warm","Tumble dry low","Expect initial colour bleeding in undyed versions"]',NULL),

('BED-005','Silk Eye Mask','Bedroom',45.00,60,'In Stock','China (Certified Ethical Silk)',0.05,
 '["Blush","Navy"]','Biodegradable',NULL,
 'Pure 22-momme mulberry silk for total blackout. Hypoallergenic and gentle on delicate eye skin.',
 '["22-momme mulberry silk","Adjustable strap","100% blackout"]',
 '["Hand wash cold","Do not tumble dry","Store flat to prevent creasing"]',NULL),

('BED-006','Weighted Blanket (Glass Bead)','Bedroom',220.00,8,'In Stock','Manufactured in China, designed in Australia',5.0,
 '["5kg","7kg","9kg"]',NULL,NULL,
 'Evenly distributed micro glass beads deliver deep pressure stimulation. Cotton outer shell is breathable and machine washable.',
 '["Micro glass bead fill","100% cotton shell","Recommended: 10% of body weight"]',
 '["Machine wash cold, gentle cycle","Tumble dry low","Do not dry clean"]',
 'WEIGHT SELECTION: Choose a blanket that is approximately 10% of your body weight. E.g., 60kg person → 7kg blanket.'),

-- BATHROOM
('BATH-001','Bamboo Towel Set','Bathroom',65.00,50,'In Stock','India',0.8,
 '["Bath Sheet","Hand Towel","Face Washer"]','Certified Organic',NULL,
 '500 GSM bamboo-cotton blend towels. Ultra-absorbent, naturally antibacterial, and certified free of harmful chemicals.',
 '["500 GSM bamboo-cotton blend","OEKO-TEX certified","Available in 3 sizes"]',
 '["Machine wash warm","Tumble dry medium","Avoid fabric softener—it reduces absorbency"]',
 'ABSORBENCY TIP: New bamboo towels may feel less absorbent on first use. After 2-3 washes without softener, absorbency increases significantly.'),

('BATH-002','Diatomite Stone Bath Mat','Bathroom',75.00,22,'In Stock','China',1.5,
 '["Sand","Grey"]',NULL,NULL,
 'Fast-drying natural diatomite stone mat. Water is absorbed in seconds—no more soggy mats or mildew.',
 '["Natural diatomite stone","Dries 3x faster than cotton","Anti-slip rubber base"]',
 '["Sand lightly with fine sandpaper if absorption reduces","Wipe clean with damp cloth","Do not machine wash","Keep out of direct sunlight for extended periods"]',
 'MAINTENANCE: If water beads on the surface, lightly sand with 120-grit sandpaper to restore absorption. Rinse and allow to dry fully before use.'),

('BATH-003','Safety Razor','Bathroom',55.00,35,'In Stock','Germany',0.12,
 '["Silver","Rose Gold","Matte Black"]',NULL,NULL,
 'Precision-weighted German zinc alloy safety razor. Single blade = zero plastic waste, zero razor burn.',
 '["Zinc alloy handle","Compatible with standard double-edge blades","85mm handle length"]',
 '["Rinse and dry after each use","Store with cap on","Replace blade every 5-7 shaves"]',
 'BEGINNER TIP: Hold razor at a 30-degree angle to skin. Let the weight of the razor do the work—no pressure required.'),

('BATH-004','Safety Razor Blades (10 Pack)','Bathroom',12.00,200,'In Stock','Germany',0.03,
 '["Standard"]',NULL,NULL,
 'Premium German-made double-edge blades. Compatible with all standard safety razors.',
 '["100% recyclable steel","10 blades per pack","~70 shaves total"]',
 '["Recycle in a blade disposal tin","Store in dry location","Do not attempt to resharpen"]',NULL),

('BATH-005','Toilet Cleaning Bombs','Bathroom',18.00,75,'In Stock','Australia',0.18,
 '["Eucalyptus","Lemon"]','Australian Made',NULL,
 'Drop one in, watch it fizz. Natural citric acid and essential oil cleaning bombs. Zero plastic, zero harsh chemicals.',
 '["Citric acid base","Australian essential oils","6 bombs per pack","Plastic-free packaging"]',
 '["Drop one bomb into toilet bowl","Leave 15–30 minutes or overnight","Scrub and flush","Safe for septic systems"]',NULL),

('BATH-006','Konjac Facial Sponge','Bathroom',16.00,90,'In Stock','South Korea',0.03,
 '["Charcoal (Oily)","Pink Clay (Sensitive)"]','Biodegradable',NULL,
 '100% natural konjac root sponge. Gently exfoliates and cleanses without stripping natural oils.',
 '["100% konjac root","Naturally biodegradable","Replace every 4-6 weeks"]',
 '["Rinse and squeeze gently after use","Hang to dry between uses","Compost at end of life"]',
 'FIRST USE: Soak sponge in warm water for 3-5 minutes until fully softened before first use.'),

-- DINING
('DIN-001','Saltbush Dinner Plate (Set of 4)','Dining',120.00,18,'In Stock','Handcrafted in Vietnam',1.8,
 '["Matte Black","Speckled White","Earth"]',NULL,NULL,
 'Artisan stoneware plates with a reactive glaze finish—no two are exactly alike. Dishwasher and microwave safe.',
 '["Stoneware","Dishwasher safe","Microwave safe","Diameter: 27cm"]',
 '["Dishwasher safe (top rack preferred)","Avoid sudden temperature changes to prevent thermal shock","Chip-resistant but handle with care"]',
 'THERMAL SHOCK WARNING: Do not place cold stoneware directly into a hot oven. Allow plate to reach room temperature first.'),

('DIN-002','Saltbush Ramen Bowl','Dining',85.00,24,'In Stock','Handcrafted in Vietnam',0.7,
 '["Matte Black","Speckled White"]',NULL,NULL,
 'Deep, wide-rimmed stoneware bowl perfect for ramen, pho, or a generous serve of granola.',
 '["Stoneware","Diameter: 18cm, Depth: 8cm","Dishwasher and microwave safe"]',
 '["Dishwasher safe","Microwave safe","Avoid thermal shock"]',NULL),

('DIN-003','Acacia Wood Serving Paddle','Dining',55.00,42,'In Stock','Indonesia',0.5,
 '["Rectangle","Round"]',NULL,NULL,
 'Beautiful FSC-certified acacia wood serving board. Perfect for cheese, charcuterie, and bread.',
 '["FSC-certified acacia wood","Natural food-safe oil finish","Rectangle: 40 x 20cm / Round: 30cm diameter"]',
 '["Hand wash only—never dishwasher","Oil monthly with food-grade mineral oil","Allow to dry standing upright"]',
 'MAINTENANCE: Apply a thin coat of food-grade mineral or beeswax oil monthly to prevent drying and cracking.'),

('DIN-004','Recycled Glass Tumbler (Set of 4)','Dining',68.00,15,'In Stock','Mouth-blown in Turkey',0.9,
 '["Clear","Amber","Bottle Green"]',NULL,NULL,
 'Each tumbler is mouth-blown from 100% recycled glass—slight variations in colour and shape are features, not faults.',
 '["100% recycled glass","Mouth-blown","Capacity: 300ml each","Dishwasher safe"]',
 '["Dishwasher safe","Handle with care—natural variations may mean slight fragility","Variations in colour/size are normal"]',NULL),

('DIN-005','Brass & Wood Salad Servers','Dining',72.00,19,'In Stock','India',0.3,
 '["Gold-Teak"]',NULL,NULL,
 'Solid teak handles with a hammered brass spoon and fork. A statement piece for your table.',
 '["Solid teak handle","Hammered brass head","Hand wash only","Length: 30cm"]',
 '["Hand wash only—never dishwasher","Dry immediately after washing","Polish brass with lemon juice if tarnished"]',NULL),

('DIN-006','Bamboo Cutlery Set (Travel)','Dining',24.00,110,'In Stock','China',0.15,
 '["Sage Pouch","Charcoal Pouch"]',NULL,NULL,
 'Everything you need on the go. Knife, fork, spoon, chopsticks, and straw in a zippered linen pouch.',
 '["Knife, fork, spoon, chopsticks, straw","Zippered linen pouch","Bamboo handle"]',
 '["Hand wash and air dry before storing","Do not microwave","Compost at end of life"]',NULL),

-- KITCHEN
('KIT-001','Zero-Waste Bento Box','Kitchen',48.00,30,'In Stock','China (ISO 14001 certified factory)',0.5,
 '["1200ml"]',NULL,NULL,
 'Leak-proof stainless steel bento box with 3 removable dividers. Perfect for meal prep, zero plastic required.',
 '["18/8 food-grade stainless steel","3 removable dividers","Leak-proof lid","1200ml capacity"]',
 '["Hand wash lid (dishwasher top rack)","Do not microwave","Dishwasher safe (box only)"]',NULL),

('KIT-002','Beeswax Wrap Starter Pack','Kitchen',28.00,85,'In Stock','New Zealand',0.15,
 '["Mixed Size (S-M-L)"]','Certified Organic','{"small":"20 x 20 cm","medium":"25 x 25 cm","large":"33 x 33 cm"}',
 'Reusable, compostable beeswax wraps to replace cling film. Use the warmth of your hands to mould and seal.',
 '["Organic cotton, beeswax, pine resin, jojoba","Lasts 12+ months with care","Compostable at end of life"]',
 '["Wash in cold water with mild soap","Air dry","Do not use with raw meat or fish","Do not use in microwave or with hot foods","Compost when worn out"]',
 'NOT SUITABLE FOR: Raw meat, fish, or very hot foods. The beeswax melts at high temperatures.'),

('KIT-003','Vegan Wax Wrap Pack','Kitchen',26.00,60,'In Stock','New Zealand',0.14,
 '["Mixed Size (S-M-L)"]','Vegan Certified',NULL,
 'The vegan alternative to beeswax wrap. Uses plant-based wax for the same cling without any animal products.',
 '["Organic cotton, plant-based wax","Vegan certified","Lasts 12+ months"]',
 '["Wash in cold water with mild soap","Air dry","Do not use with raw meat or fish","Compost when worn out"]',NULL),

('KIT-004','Silicone Stretch Lids (6 Pack)','Kitchen',22.00,95,'In Stock','China',0.2,
 '["Clear"]',NULL,NULL,
 'Fits bowls, pots, cans, and jars. Microwave and dishwasher safe. Replaces plastic cling wrap on curved surfaces.',
 '["Food-grade silicone","6 sizes: XS to XL","Microwave, dishwasher, and freezer safe","-40°C to +230°C"]',
 '["Dishwasher safe","Do not use over open flame","Stretch gently to avoid damage"]',NULL),

('KIT-005','Compostable Sponge Cloths','Kitchen',14.00,120,'In Stock','Sweden',0.1,
 '["Wattle Print","Gum Nut Print"]','Compostable',NULL,
 'Each cloth replaces 15 rolls of paper towel. Compostable, fast-drying, and machine washable.',
 '["Wood cellulose and cotton","Each cloth replaces ~15 paper towel rolls","Machine washable up to 60°C","Home compostable"]',
 '["Machine wash up to 60°C","Tumble dry or air dry","Do not use with bleach","Compost at end of life"]',NULL),

('KIT-006','Coconut Coir Scourer (4 Pack)','Kitchen',12.00,140,'In Stock','Sri Lanka',0.1,
 '["Natural"]','Compostable',NULL,
 'Natural coconut husk scourers. Tough on grime, gentle on non-stick surfaces, and 100% compostable.',
 '["100% coconut coir","Scrubs without scratching","Home compostable","4 scourers per pack"]',
 '["Rinse after use","Allow to dry between uses","Compost when worn"]',NULL),

('KIT-007','Glass Pantry Jar','Kitchen',18.00,88,'In Stock','China',0.4,
 '["500ml","1L","2L"]',NULL,NULL,
 'Wide-mouth borosilicate glass jar with airtight bamboo lid. Perfect for bulk dry goods, legumes, and grains.',
 '["Borosilicate glass","Airtight bamboo lid","Available in 3 sizes"]',
 '["Dishwasher safe (jar only)","Hand wash lid","Do not microwave with bamboo lid attached"]',NULL),

('KIT-008','Unbleached Baking Paper','Kitchen',8.00,200,'In Stock','Germany',0.08,
 '["15m Roll"]','Unbleached',NULL,
 '100% unbleached, non-chlorine baking paper. PFAS-free, compostable, and works up to 240°C.',
 '["Unbleached, chlorine-free","PFAS-free silicone coating","Use up to 240°C","Compostable after use"]',
 '["Do not use under a grill or in direct flame","Compost after use","Store in a cool dry place"]',NULL),

-- LIVING
('LIV-001','Bower Recycled Wool Throw','Living',185.00,20,'In Stock','Wool from Australia, woven in Germany',0.9,
 '["Grey Tartan","Navy","Oatmeal"]','Recycled Material',NULL,
 'Woven from 80% recycled wool. Heirloom-quality construction designed to last a lifetime.',
 '["80% recycled wool, 20% recycled polyester","155 x 200 cm","OEKO-TEX certified","Machine washable"]',
 '["Machine wash cold, gentle cycle","Lay flat to dry","Do not tumble dry","Store folded to prevent stretching"]',NULL),

('LIV-002','Jute Area Rug','Living',320.00,5,'In Stock','Hand-woven in India',8.0,
 '["Rectangle (2x3m)","Round (2m)"]',NULL,NULL,
 'Hand-woven natural jute rug. Adds warmth and texture to any room—biodegradable and sustainably harvested.',
 '["100% natural jute","Hand-woven","Recommended use: low traffic areas (no direct sunlight)"]',
 '["Spot clean with damp cloth","Avoid moisture and direct sunlight","Vacuum regularly to remove dirt and fibres","Professional clean recommended for deep stains"]',
 'PLACEMENT NOTE: Jute rugs are not suitable for bathrooms or high-moisture areas as natural fibre is susceptible to mould.'),

('LIV-003','Hemp Floor Cushion','Living',110.00,14,'In Stock','India',2.0,
 '["Sage","Rust"]',NULL,NULL,
 'Firm, flat-floor cushion filled with recycled cotton batting. Great for meditation, yoga, or extra seating.',
 '["Hemp outer shell","Recycled cotton fill","60 x 60 x 15 cm","Removable cover"]',
 '["Machine wash cover cold","Spot clean insert","Air dry cover","Reshape while damp"]',NULL),

('LIV-004','Dried Native Arrangement','Living',78.00,3,'In Stock','Harvested in Western Australia',0.2,
 '["Eucalypt Mix","Banksia Mix"]',NULL,NULL,
 'Sustainably harvested dried native flowers from Western Australia. No water required—lasts for years.',
 '["Sustainably harvested WA natives","No water required","Lasts 2+ years with care","Arrangement: approx. 40cm height"]',
 '["Keep out of direct sunlight to preserve colour","Dust occasionally with a hairdryer on cool setting","Do not place in bathrooms or high humidity areas"]',NULL)

ON CONFLICT (id) DO UPDATE SET
  price_aud = EXCLUDED.price_aud,
  stock_level = EXCLUDED.stock_level,
  status = EXCLUDED.status,
  marketing_hook = EXCLUDED.marketing_hook,
  updated_at = now();

-- ===== SEED: FAQS =====
INSERT INTO faqs (question, answer, category) VALUES
('Do you offer free shipping?', 'Yes! Orders over $150 qualify for free standard shipping across Australia. Express shipping is available for $19.95 and standard shipping is $9.95.', 'Shipping'),
('How long does delivery take?', 'Standard shipping takes 5–8 business days. Express shipping takes 2–3 business days. Free shipping takes 7–10 business days.', 'Shipping'),
('Do you ship internationally?', 'Currently we ship within Australia and to New Zealand. International shipping rates apply for NZ orders.', 'Shipping'),
('What is your returns policy?', 'We accept returns within 30 days of delivery for unused, unopened items in original packaging. Please contact us at hello@bluebush.com.au to arrange a return.', 'Returns'),
('Are your products eco-certified?', 'Many of our products hold certifications such as OEKO-TEX, GOTS Organic, or Compostable certifications. Look for the 🌿 eco badge on individual product pages.', 'Products'),
('Are beeswax wraps suitable for vegans?', 'Our Beeswax Wraps are not vegan as they contain beeswax. We recommend our Vegan Wax Wrap Pack (KIT-003) as a fully plant-based alternative.', 'Products'),
('Can I use the beeswax wrap with raw meat?', 'No. Beeswax wraps should not be used with raw meat or fish, as they cannot be sanitised at high temperatures. Use our Silicone Stretch Lids (KIT-004) for this purpose instead.', 'Products'),
('Are the stoneware plates dishwasher safe?', 'Yes, our Saltbush stoneware plates and bowls are dishwasher safe (top rack preferred) and microwave safe. Avoid sudden temperature changes to prevent thermal shock.', 'Products'),
('How do I restore my diatomite bath mat?', 'If water starts to bead on the surface rather than absorb, lightly sand with 120-grit sandpaper. Rinse well and allow to dry completely before use.', 'Products'),
('Is the weighted blanket machine washable?', 'Yes, our weighted blankets can be machine washed on a cold, gentle cycle. Tumble dry on low heat. Do not dry clean.', 'Products'),
('What sizes are the weighted blankets available in?', 'Our Weighted Blanket (Glass Bead) is available in 5kg, 7kg, and 9kg. We recommend choosing a blanket that is approximately 10% of your body weight.', 'Products'),
('How do I care for my acacia wood serving board?', 'Hand wash only—never put in the dishwasher. Oil monthly with food-grade mineral oil to prevent drying and cracking. Allow to dry standing upright.', 'Products'),
('Are the konjac sponges biodegradable?', 'Yes! Our Konjac Facial Sponges are 100% natural konjac root and are fully biodegradable. Compost them at the end of their life (approximately 4–6 weeks of use).', 'Products'),
('Do you have a physical store?', 'We are an online-only store currently based in Forrestfield, Western Australia. Visit us at 42 Wandoo Way, Jarrawood WA 6999 or contact us at hello@bluebush.com.au.', 'General'),
('Can I modify or cancel my order?', 'Please contact us at hello@bluebush.com.au within 2 hours of placing your order to request a modification or cancellation. Once an order has been dispatched, it cannot be cancelled.', 'Orders')
ON CONFLICT DO NOTHING;

-- ===== SEED: CHATBOT TRAINING =====
INSERT INTO chatbot_training (question, answer, tags) VALUES
('What is BlueBush?', 'BlueBush is a Perth-based online retailer of premium sustainable homewares. We stock ethically sourced, beautifully crafted essentials for every room in your home—from OEKO-TEX certified linen sheets to FSC-certified timber serving boards.', ARRAY['brand','about']),
('What makes BlueBush sustainable?', 'We carefully select products that are certified organic, biodegradable, compostable, made from recycled materials, or manufactured under ethical labour conditions. Many products carry third-party certifications like OEKO-TEX, GOTS, FSC, and Compostable logos.', ARRAY['sustainability','brand']),
('Do you sell gift cards?', 'Yes, digital gift cards are available in amounts from $25 to $250. Contact us at hello@bluebush.com.au to purchase a gift card for a loved one.', ARRAY['gifts','products']),
('Is BlueBush an Australian company?', 'Yes! BlueBush is proudly Australian, based in Forrestfield, Western Australia. While some of our products are manufactured overseas under ethical conditions, we are a 100% Australian-owned and operated business.', ARRAY['brand','australia'])
ON CONFLICT DO NOTHING;
