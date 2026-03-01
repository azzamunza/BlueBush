// ============================================================
// BlueBush Supabase Client
// Requires: env.js loaded first, then @supabase/supabase-js CDN
// ============================================================

(function () {
  'use strict';

  // ── Detect whether Supabase is configured ──────────────────
  function isConfigured() {
    return (
      window.SUPABASE_URL &&
      window.SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      window.SUPABASE_ANON_KEY &&
      window.SUPABASE_ANON_KEY !== 'your-anon-key-here'
    );
  }

  // ── Initialise client (null when not configured) ───────────
  let _client = null;
  function getClient() {
    if (_client) return _client;
    if (!isConfigured()) return null;
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      console.warn('BlueBush: Supabase JS library not loaded.');
      return null;
    }
    try {
      _client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('BlueBush: Failed to create Supabase client:', e);
    }
    return _client;
  }

  // ── Normalise flat DB row → nested product shape ───────────
  // The front-end templates use p.dynamic_data, p.static_data,
  // p.content_triage, and p.rag_resources so we preserve that
  // structure when reading from Supabase.
  function normaliseProduct(row) {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      dynamic_data: {
        price_aud: parseFloat(row.price_aud),
        stock_level: parseInt(row.stock_level, 10),
        status: row.status,
        next_shipment_eta: row.next_shipment_eta || null,
        active_promotions: row.active_promotions || [],
      },
      static_data: {
        origin: row.origin || '',
        weight_kg: parseFloat(row.weight_kg) || 0,
        variants: Array.isArray(row.variants) ? row.variants : (row.variants || []),
        eco_badge: row.eco_badge || null,
        dimensions_cm: row.dimensions_cm || null,
      },
      content_triage: {
        marketing_hook: row.marketing_hook || '',
        technical_specs: Array.isArray(row.technical_specs) ? row.technical_specs : (row.technical_specs || []),
      },
      rag_resources: {
        care_instructions: Array.isArray(row.care_instructions) ? row.care_instructions : (row.care_instructions || []),
        manual_excerpt: row.manual_excerpt || null,
      },
    };
  }

  // ── Public API ─────────────────────────────────────────────

  /**
   * Fetch all products from Supabase.
   * Returns null when Supabase is not configured so callers can
   * fall back to the static JSON file.
   * @returns {Promise<Array|null>}
   */
  async function fetchProducts() {
    const client = getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      return (data || []).map(normaliseProduct);
    } catch (e) {
      console.warn('BlueBush: fetchProducts failed, will fall back to JSON.', e);
      return null;
    }
  }

  /**
   * Fetch a single product by ID from Supabase.
   * Returns null on failure / not configured.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async function fetchProduct(id) {
    const client = getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return normaliseProduct(data);
    } catch (e) {
      console.warn('BlueBush: fetchProduct failed, will fall back to JSON.', e);
      return null;
    }
  }

  /**
   * Fetch all FAQ rows from Supabase.
   * Returns null when Supabase is not configured.
   * @returns {Promise<Array|null>}
   */
  async function fetchFaqs() {
    const client = getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('faqs')
        .select('*')
        .order('category')
        .order('id');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('BlueBush: fetchFaqs failed, will fall back to static content.', e);
      return null;
    }
  }

  /**
   * Place an order atomically via the place_order RPC.
   * Handles stock decrement and backorder logic server-side.
   *
   * @param {object} orderPayload
   * @param {string} orderPayload.order_id
   * @param {string} orderPayload.customer_name
   * @param {string} orderPayload.customer_email
   * @param {string} [orderPayload.customer_phone]
   * @param {string} [orderPayload.ship_address]
   * @param {string} [orderPayload.ship_suburb]
   * @param {string} [orderPayload.ship_state]
   * @param {string} [orderPayload.ship_postcode]
   * @param {string} [orderPayload.ship_country]
   * @param {boolean} [orderPayload.billing_same_as_ship]
   * @param {string} [orderPayload.bill_address]
   * @param {string} [orderPayload.bill_suburb]
   * @param {string} [orderPayload.bill_state]
   * @param {string} [orderPayload.bill_postcode]
   * @param {string} [orderPayload.bill_country]
   * @param {string} [orderPayload.shipping_method]
   * @param {number} [orderPayload.shipping_cost]
   * @param {string} [orderPayload.payment_method]
   * @param {number} orderPayload.subtotal
   * @param {number} orderPayload.total
   * @param {Array<{product_id:string, product_name:string, variant:string|null, price_aud:number, quantity:number, is_backorder:boolean}>} orderPayload.items
   *
   * @returns {Promise<{success:boolean, order_id:string|null, backorder_items:Array, error:string|null}>}
   */
  async function placeOrder(orderPayload) {
    const client = getClient();
    if (!client) {
      // Supabase not configured: simulate success (demo mode)
      return { success: true, order_id: orderPayload.order_id, backorder_items: [], error: null, demo: true };
    }
    try {
      const { data, error } = await client.rpc('place_order', {
        p_order_id:             orderPayload.order_id,
        p_customer_name:        orderPayload.customer_name,
        p_customer_email:       orderPayload.customer_email,
        p_customer_phone:       orderPayload.customer_phone || null,
        p_ship_address:         orderPayload.ship_address || null,
        p_ship_suburb:          orderPayload.ship_suburb || null,
        p_ship_state:           orderPayload.ship_state || null,
        p_ship_postcode:        orderPayload.ship_postcode || null,
        p_ship_country:         orderPayload.ship_country || 'AU',
        p_billing_same_as_ship: orderPayload.billing_same_as_ship !== false,
        p_bill_address:         orderPayload.bill_address || null,
        p_bill_suburb:          orderPayload.bill_suburb || null,
        p_bill_state:           orderPayload.bill_state || null,
        p_bill_postcode:        orderPayload.bill_postcode || null,
        p_bill_country:         orderPayload.bill_country || 'AU',
        p_shipping_method:      orderPayload.shipping_method || 'standard',
        p_shipping_cost:        orderPayload.shipping_cost || 9.95,
        p_payment_method:       orderPayload.payment_method || 'card',
        p_subtotal:             orderPayload.subtotal,
        p_total:                orderPayload.total,
        p_items:                JSON.stringify(orderPayload.items),
      });
      if (error) throw error;
      return {
        success: true,
        order_id: orderPayload.order_id,
        backorder_items: (data && data.backorder_items) ? data.backorder_items : [],
        error: null,
      };
    } catch (e) {
      console.error('BlueBush: placeOrder RPC failed:', e);
      return { success: false, order_id: null, backorder_items: [], error: e.message || String(e) };
    }
  }

  // ── Expose on window ───────────────────────────────────────
  window.bbSupabase = {
    isConfigured,
    fetchProducts,
    fetchProduct,
    fetchFaqs,
    placeOrder,
  };
})();
