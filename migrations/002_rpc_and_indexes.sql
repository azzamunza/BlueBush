-- ============================================================
-- BlueBush Migration 002: RPC, Indexes, Backorder Support
-- Run via: psql $SUPABASE_DB_URL -f migrations/002_rpc_and_indexes.sql
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ===== ADD BACKORDER FLAG TO ORDER ITEMS =====
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS is_backorder BOOLEAN NOT NULL DEFAULT FALSE;

-- ===== PERFORMANCE INDEXES =====
CREATE INDEX IF NOT EXISTS idx_products_category   ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_stock      ON products (stock_level);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

-- ===== ATOMIC ORDER PLACEMENT RPC =====
-- place_order: atomically creates the order header + items and
-- decrements stock. For items where stock is insufficient and
-- the caller has opted to backorder, the item is flagged
-- (is_backorder = TRUE) and stock is NOT decremented below 0.
--
-- Input parameters are prefixed with p_ to avoid name clashes.
-- p_items is a JSON array of:
--   { product_id, product_name, variant, price_aud, quantity, is_backorder }
--
-- Returns JSON: { order_id, backorder_items: [{product_id, product_name}] }
-- ============================================================
CREATE OR REPLACE FUNCTION place_order(
  p_order_id             TEXT,
  p_customer_name        TEXT,
  p_customer_email       TEXT,
  p_customer_phone       TEXT        DEFAULT NULL,
  p_ship_address         TEXT        DEFAULT NULL,
  p_ship_suburb          TEXT        DEFAULT NULL,
  p_ship_state           TEXT        DEFAULT NULL,
  p_ship_postcode        TEXT        DEFAULT NULL,
  p_ship_country         TEXT        DEFAULT 'AU',
  p_billing_same_as_ship BOOLEAN     DEFAULT TRUE,
  p_bill_address         TEXT        DEFAULT NULL,
  p_bill_suburb          TEXT        DEFAULT NULL,
  p_bill_state           TEXT        DEFAULT NULL,
  p_bill_postcode        TEXT        DEFAULT NULL,
  p_bill_country         TEXT        DEFAULT 'AU',
  p_shipping_method      TEXT        DEFAULT 'standard',
  p_shipping_cost        NUMERIC     DEFAULT 9.95,
  p_payment_method       TEXT        DEFAULT 'card',
  p_subtotal             NUMERIC     DEFAULT 0,
  p_total                NUMERIC     DEFAULT 0,
  p_items                TEXT        DEFAULT '[]'   -- JSON array
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item           JSON;
  v_items_arr      JSON;
  v_product_id     TEXT;
  v_product_name   TEXT;
  v_variant        TEXT;
  v_price          NUMERIC;
  v_qty            INTEGER;
  v_is_backorder   BOOLEAN;
  v_current_stock  INTEGER;
  v_backorder_list JSON := '[]'::JSON;
  v_decrement      INTEGER;
BEGIN
  -- Parse items JSON
  v_items_arr := p_items::JSON;

  -- Validate order ID is not already used
  IF EXISTS (SELECT 1 FROM orders WHERE id = p_order_id) THEN
    RAISE EXCEPTION 'Order ID % already exists', p_order_id;
  END IF;

  -- Insert order header
  INSERT INTO orders (
    id, customer_name, customer_email, customer_phone,
    ship_address, ship_suburb, ship_state, ship_postcode, ship_country,
    billing_same_as_ship,
    bill_address, bill_suburb, bill_state, bill_postcode, bill_country,
    shipping_method, shipping_cost, payment_method,
    subtotal, total, status
  ) VALUES (
    p_order_id, p_customer_name, p_customer_email, p_customer_phone,
    p_ship_address, p_ship_suburb, p_ship_state, p_ship_postcode, p_ship_country,
    p_billing_same_as_ship,
    p_bill_address, p_bill_suburb, p_bill_state, p_bill_postcode, p_bill_country,
    p_shipping_method, p_shipping_cost, p_payment_method,
    p_subtotal, p_total, 'confirmed'
  );

  -- Process each order item
  FOR v_item IN SELECT value FROM json_array_elements(v_items_arr) AS value
  LOOP
    v_product_id   := v_item->>'product_id';
    v_product_name := v_item->>'product_name';
    v_variant      := v_item->>'variant';
    v_price        := (v_item->>'price_aud')::NUMERIC;
    v_qty          := COALESCE((v_item->>'quantity')::INTEGER, 1);
    v_is_backorder := COALESCE((v_item->>'is_backorder')::BOOLEAN, FALSE);

    -- Get current stock with row lock to prevent race conditions
    SELECT stock_level INTO v_current_stock
      FROM products
     WHERE id = v_product_id
       FOR UPDATE;

    IF v_current_stock IS NULL THEN
      -- Product not found; insert as backorder item
      v_is_backorder := TRUE;
    ELSIF v_current_stock < v_qty THEN
      -- Insufficient stock: backorder the whole line
      v_is_backorder := TRUE;
    ELSE
      -- Sufficient stock: decrement
      v_is_backorder := FALSE;
      v_decrement    := v_qty;
      UPDATE products
         SET stock_level = GREATEST(0, stock_level - v_decrement),
             status      = CASE
                             WHEN GREATEST(0, stock_level - v_decrement) = 0 THEN 'Out of Stock'
                             WHEN GREATEST(0, stock_level - v_decrement) <= 5 THEN 'Low Stock'
                             ELSE 'In Stock'
                           END
       WHERE id = v_product_id;
    END IF;

    -- Insert order item
    INSERT INTO order_items (
      order_id, product_id, product_name, variant,
      price_aud, quantity, is_backorder
    ) VALUES (
      p_order_id, v_product_id, v_product_name, v_variant,
      v_price, v_qty, v_is_backorder
    );

    -- Track backorder items for return value
    IF v_is_backorder THEN
      v_backorder_list := (
        SELECT json_agg(elem) FROM (
          SELECT * FROM json_array_elements(v_backorder_list)
          UNION ALL
          SELECT json_build_object(
            'product_id',   v_product_id,
            'product_name', v_product_name
          )
        ) t(elem)
      );
    END IF;
  END LOOP;

  RETURN json_build_object(
    'order_id',       p_order_id,
    'backorder_items', COALESCE(v_backorder_list, '[]'::JSON)
  );
END;
$$;

-- Grant execute to anon role (used by Supabase PostgREST)
GRANT EXECUTE ON FUNCTION place_order TO anon;

-- ===== RLS POLICY: Allow anon to call place_order via RPC =====
-- (SECURITY DEFINER on the function already bypasses RLS for
--  the internal writes; the GRANT above allows the call itself.)

-- ===== ENSURE chatbot_training read policy exists =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'chatbot_training'
      AND policyname = 'public_read_chatbot'
  ) THEN
    CREATE POLICY "public_read_chatbot"
      ON chatbot_training FOR SELECT USING (true);
  END IF;
END
$$;
