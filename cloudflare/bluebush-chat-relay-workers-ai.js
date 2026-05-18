/**
 * BlueBush Cloudflare Workers AI Chat Relay with RAG
 * ─────────────────────────────────────────────────────────────────
 * File: cloudflare/bluebush-chat-relay-rag-v2.js
 *
 * This version replaces NVIDIA NIMs with Cloudflare Workers AI (Free Tier).
 * 
 * ─────────────────────────────────────────────────────────────────
 * REQUIRED CLOUDFLARE BINDINGS:
 *   1. AI: Enable "Workers AI" in your Cloudflare dashboard.
 * 
 * REQUIRED ENV VARIABLES:
 *   - ALLOWED_ORIGINS: "https://azzamunza.github.io"
 *   - SUPABASE_URL: your-project.supabase.co
 *   - SUPABASE_SERVICE_ROLE_KEY: your-secret-key
 * ─────────────────────────────────────────────────────────────────
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // 1. CORS Preflight
    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowedOrigin(origin, env) ? origin : "https://azzamunza.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Routing & Validation
    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return new Response("Not Found", { status: 404 });
    }

    if (!isAllowedOrigin(origin, env)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
    }

    const message = (body?.message || "").toString().trim();
    if (!message) return new Response(JSON.stringify({ error: "Missing message" }), { status: 400, headers: corsHeaders });

    // 3. RAG Pipeline
    let contextString = "";
    try {
      // Step A: Generate Embeddings using Workers AI
      const embeddingResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
        text: [message]
      });
      const queryEmbedding = embeddingResponse.data[0];

      // Step B: Retrieve from Supabase
      const hits = await retrieveContext(queryEmbedding, env);
      
      // Step C: Format Context
      contextString = buildContextString(hits);
    } catch (err) {
      console.error("RAG Error:", err);
      // Fallback: Continue without context
    }

    // 4. Generate AI Response
    const systemMessage = systemPrompt(contextString);
    
    try {
      const chatResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        max_tokens: 512
      });

      return new Response(JSON.stringify({ 
        reply: chatResponse.response,
        conversationId: null 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "AI Generation Error", details: err.message }), { status: 502, headers: corsHeaders });
    }
  }
};

// --- Helpers ---

function isAllowedOrigin(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim());
  return allowed.includes(origin);
}

async function retrieveContext(queryEmbedding, env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return [];
  
  const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/match_rag_documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: 5
    }),
  });

  return resp.ok ? await resp.json() : [];
}

function buildContextString(hits) {
  if (!hits || hits.length === 0) return "";
  return hits
    .filter(h => h.score > 0.4)
    .map((h, i) => `[Doc ${i+1}]: ${h.content}`)
    .join("\n\n");
}

function systemPrompt(context) {
  const base = `You are Chloe from BlueBush customer support. BlueBush is an eco-friendly homewares brand based in Perth, WA. 
Chat style: brief, natural, Australian English (No worries, Cheers). Avoid 'As an AI' or 'I understand'. Stay in character.`;
  
  if (!context) return base;
  return `${base}\n\nUse this context to help answer accurately:\n${context}`;
}
