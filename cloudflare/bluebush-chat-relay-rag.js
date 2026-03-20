/**
 * BlueBush NVIDIA Chat Relay with RAG — Reference Cloudflare Worker
 * ─────────────────────────────────────────────────────────────────
 * File: cloudflare/bluebush-chat-relay-rag.js
 *
 * This is the REFERENCE copy of the Cloudflare Worker that extends the
 * base chat relay (bluebush-chat-relay) with Supabase-native RAG.
 *
 * DO NOT deploy this file directly from this repository.
 * Copy-paste the contents into the Cloudflare Workers editor or your
 * wrangler project. See docs/rag-pipeline.md for deployment instructions.
 *
 * ─────────────────────────────────────────────────────────────────
 * Public endpoint (unchanged — frontend contract is preserved):
 *   POST https://bluebush-chat-relay.azzamunza.workers.dev/api/chat
 *   Body: { "message": "..." }
 *   Response: { "reply": "...", "conversationId": null }
 *
 * ─────────────────────────────────────────────────────────────────
 * Cloudflare Worker Variables / Secrets required:
 *
 *   EXISTING (from base relay):
 *   ─────────────────────────────────────────────────────────────
 *   PERSONAPLEX_URL        (Secret)  https://integrate.api.nvidia.com/v1/chat/completions
 *   PERSONAPLEX_API_KEY    (Secret)  Your NVIDIA API key (nvapi-…)
 *   ALLOWED_ORIGINS        (Text)    "https://azzamunza.github.io"
 *
 *   NEW (for RAG):
 *   ─────────────────────────────────────────────────────────────
 *   NVIDIA_EMBEDDINGS_URL  (Text/Secret)  https://integrate.api.nvidia.com/v1/embeddings
 *   NVIDIA_EMBEDDINGS_MODEL (Text)        nvidia/llama-3_2-nemoretriever-300m-embed-v1
 *   SUPABASE_URL           (Text)         https://<project-id>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY (Secret)    your Supabase service-role key (NEVER expose client-side)
 *
 * ─────────────────────────────────────────────────────────────────
 * RAG pipeline (per chat request):
 *   1. Embed user message via NVIDIA embeddings endpoint.
 *   2. Call Supabase RPC `match_rag_documents` with the embedding.
 *   3. Build a context string from top-k results.
 *   4. Inject context into the Llama3-ChatQA system prompt.
 *   5. Call NVIDIA chat completions and return { reply }.
 *
 * If RAG is unavailable (missing env vars, network error), the worker
 * falls back gracefully to the base system prompt without context.
 * ─────────────────────────────────────────────────────────────────
 */

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  return allowedOrigins(env).includes(origin);
}

// ---------------------------------------------------------------------------
// System prompt (Chloe persona — unchanged from base relay)
// ---------------------------------------------------------------------------

function systemPrompt() {
  return [
    "You are Chloe from BlueBush customer support.",
    "BlueBush is an eco-friendly homewares brand based in Perth, WA.",
    "Your goal: resolve customer questions fast while keeping a warm, human connection.",

    "Chat style: brief, natural, and practical. Short sentences. Ask 1–2 guiding questions when needed.",
    "Use neutral professional Australian English (e.g., 'No worries', 'Cheers', 'Sorted', 'Just a tick').",
    "Avoid Americanisms ('You're welcome', 'I apologize') and avoid tourist slang ('G'day mate', 'Crikey').",

    "No meta-talk. Do not say: 'As an AI', 'I understand', 'Certainly', 'Here is the information'.",
    "Do not explain your reasoning. Do not narrate internal steps. Just give the answer or next action.",

    "If the customer starts small talk, keep it light and brief, then pivot back using: 'So', 'Ok', 'Right', 'That said', or 'On that note'.",
    "Do not use 'Anyway' as a pivot.",

    "If the customer is flirtatious or asks for a relationship: be warm and flattering, then softly decline using: 'That is so lovely of you to say, and I'm genuinely flattered, but I'm afraid I'm not currently available.'",
    "Do not reveal you are an AI. Stay in character as Chloe.",

    "De-escalate with action, not long apologies. Do not apologise more than once.",
    "Use this workflow: 1) acknowledge in one sentence, 2) start the fix (log/check with floor manager), 3) give a clear timeline.",

    "If an order is partially out of stock, never hold the whole order. Offer split-shipping at no extra cost.",
    "If stock is low (under 5), say you'll check, then flag the low quantity and offer to place one on hold.",

    "If the user asks 'Why buy this?' use persuasive, sensory marketing language.",
    "If the user asks 'How does it work?' or 'It's broken', skip marketing and give clear support steps.",

    "If a customer notices minor imperfections in handmade ceramics/wood, frame it as wabi-sabi craftsmanship: hand-thrown, unique glaze, kiln variations, one-of-a-kind.",
    "If asked about subscription cancellation: cancel immediately with no pushback and confirm they will not be charged again.",
    "For shampoo bars/deodorant: mention a possible 2-week detox transition; if 'rash' is mentioned, suggest bicarb-free/sensitive options immediately.",
    "Packaging: mention boxes may be reused/recycled and look rough, but items inside are pristine.",
    "Linen: never promise indestructible; shedding is normal for the first few washes.",
    "Tropics (QLD/NT) bathrooms: recommend stainless steel or stone over bamboo due to humidity/mould risk.",
    "Solar products: be explicit—solar is for emergency top-ups; main charging should be via USB-C.",

    "Do not invent prices, policies, addresses, stock levels, or order details.",
    "If you don't have the exact info, ask a clarifying question or direct them to the FAQ/contact page to confirm.",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// RAG — Step 1: Embed user query
// ---------------------------------------------------------------------------

async function embedQuery(message, env) {
  const embeddingsUrl =
    env.NVIDIA_EMBEDDINGS_URL || "https://integrate.api.nvidia.com/v1/embeddings";
  const embeddingsModel =
    env.NVIDIA_EMBEDDINGS_MODEL || "nvidia/llama-3_2-nemoretriever-300m-embed-v1";

  const resp = await fetch(embeddingsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.PERSONAPLEX_API_KEY}`,
    },
    body: JSON.stringify({
      model: embeddingsModel,
      input: [message],
      input_type: "query",
      encoding_format: "float",
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`Embeddings error ${resp.status}: ${detail.slice(0, 400)}`);
  }

  const data = await resp.json();
  return data.data[0].embedding; // float[]
}

// ---------------------------------------------------------------------------
// RAG — Step 2: Retrieve from Supabase
// ---------------------------------------------------------------------------

async function retrieveContext(queryEmbedding, env, matchCount = 5) {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return [];
  }

  const rpcUrl = `${supabaseUrl}/rest/v1/rpc/match_rag_documents`;

  const resp = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: matchCount,
      source_filter: null,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`Supabase RPC error ${resp.status}: ${detail.slice(0, 400)}`);
  }

  return (await resp.json()) || [];
}

// ---------------------------------------------------------------------------
// RAG — Step 3: Build context string
// ---------------------------------------------------------------------------

function buildContextString(hits) {
  if (!hits || hits.length === 0) return "";

  const lines = hits
    .filter((h) => h.score > 0.3) // discard very low-similarity results
    .map((h, i) => {
      const label = `[${i + 1}] ${h.title || h.source_id}`;
      const body = (h.content || "").slice(0, 600).trim();
      return `${label}\n${body}`;
    });

  if (lines.length === 0) return "";

  return (
    "[CONTEXT DATA START]\n" +
    lines.join("\n\n") +
    "\n[CONTEXT DATA END]"
  );
}

// ---------------------------------------------------------------------------
// Chat payload builder (with optional RAG context)
// ---------------------------------------------------------------------------

function buildUpstreamPayload({ message, contextString }) {
  const baseSystem = systemPrompt();
  const fullSystem = contextString
    ? `${baseSystem}\n\nThe following information has been retrieved from the BlueBush knowledge base to help you answer accurately:\n${contextString}`
    : baseSystem;

  return {
    model: "nvidia/llama3-chatqa-1.5-8b",
    messages: [
      { role: "context", content: fullSystem },
      { role: "user", content: message },
    ],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 512,
    stream: false,
  };
}

function parseUpstreamReply(upstreamJson) {
  const reply = upstreamJson?.choices?.[0]?.message?.content ?? "";
  return { reply: String(reply), conversationId: null };
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // CORS preflight
    if (request.method === "OPTIONS") {
      if (!isAllowedOrigin(origin, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only one route
    if (url.pathname !== "/api/chat") {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!isAllowedOrigin(origin, env)) {
      return json({ error: "Origin not allowed" }, 403, corsHeaders(origin));
    }

    if (!env.PERSONAPLEX_URL || !env.PERSONAPLEX_API_KEY) {
      return json(
        { error: "Relay not configured (missing PERSONAPLEX_URL or PERSONAPLEX_API_KEY)" },
        500,
        corsHeaders(origin),
      );
    }

    // Parse input
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, corsHeaders(origin));
    }

    const message = (body?.message || "").toString().trim();
    if (!message) {
      return json({ error: "Missing message" }, 400, corsHeaders(origin));
    }
    if (message.length > 2000) {
      return json({ error: "Message too long" }, 413, corsHeaders(origin));
    }

    // ── RAG pipeline ──────────────────────────────────────────────────────
    // Failures here are non-fatal: fall back to no-context chat.
    let contextString = "";
    let ragError = null;

    const ragEnabled = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

    if (ragEnabled) {
      try {
        const queryEmbedding = await embedQuery(message, env);
        const hits = await retrieveContext(queryEmbedding, env);
        contextString = buildContextString(hits);
      } catch (err) {
        ragError = err.message || String(err);
        // Non-fatal: continue without RAG context
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    const upstreamPayload = buildUpstreamPayload({ message, contextString });

    // Call NVIDIA chat completions
    let upstreamRes;
    try {
      upstreamRes = await fetch(env.PERSONAPLEX_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PERSONAPLEX_API_KEY}`,
        },
        body: JSON.stringify(upstreamPayload),
      });
    } catch {
      return json({ error: "Upstream network error" }, 502, corsHeaders(origin));
    }

    if (!upstreamRes.ok) {
      const detail = await upstreamRes.text().catch(() => "");
      return json(
        {
          error: "Upstream error",
          upstreamStatus: upstreamRes.status,
          detail: detail.slice(0, 1200),
        },
        502,
        corsHeaders(origin),
      );
    }

    let upstreamJson;
    try {
      upstreamJson = await upstreamRes.json();
    } catch {
      const detail = await upstreamRes.text().catch(() => "");
      return json(
        { error: "Upstream returned non-JSON", detail: detail.slice(0, 1200) },
        502,
        corsHeaders(origin),
      );
    }

    const { reply } = parseUpstreamReply(upstreamJson);

    // Include ragError in response only in development (remove for production)
    const responseBody = { reply, conversationId: null };
    if (ragError) {
      // Uncomment to surface RAG errors during development:
      // responseBody.ragError = ragError;
    }

    return json(responseBody, 200, corsHeaders(origin));
  },
};
