/**
 * BlueBush Cloudflare Workers AI Chat Relay with D1
 * ─────────────────────────────────────────────────────────────────
 * File: cloudflare/bluebush-chat-relay-d1.js
 *
 * This version uses Cloudflare D1 for metadata/knowledge and 
 * Cloudflare Workers AI for generation.
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

    // 3. Knowledge Retrieval (RAG via Vectorize + D1)
    let contextString = "";
    try {
      // A. Generate Embeddings (Per TODO: @cf/baai/bge-small-en-v1.5)
      const embeddingResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
        text: [message]
      });
      const queryEmbedding = embeddingResponse.data[0];

      // B. Query Vectorize
      const vectorMatches = await env.VECTORIZE.query(queryEmbedding, { topK: 3, returnMetadata: true });
      
      if (vectorMatches.matches && vectorMatches.matches.length > 0) {
        // Fetch full content from D1 based on Vectorize IDs
        const ids = vectorMatches.matches.map(m => m.id);
        const placeholders = ids.map(() => '?').join(',');
        const d1Results = await env.DB.prepare(
          `SELECT content FROM rag_documents WHERE id IN (${placeholders})`
        ).bind(...ids).all();
        
        if (d1Results.results && d1Results.results.length > 0) {
          contextString = d1Results.results.map((r, i) => `[Doc ${i+1}]: ${r.content}`).join("\n\n");
        }
      } else {
        // Fallback to D1 text search if no vector matches found (e.g. index empty)
        const textResults = await env.DB.prepare(
          "SELECT question, answer FROM chatbot_training WHERE question LIKE ? OR answer LIKE ? LIMIT 3"
        ).bind(`%${message}%`, `%${message}%`).all();

        if (textResults.results && textResults.results.length > 0) {
          contextString = textResults.results.map((r, i) => `[Fact ${i+1}]: Q: ${r.question} A: ${r.answer}`).join("\n\n");
        }
      }
    } catch (err) {
      console.error("RAG Retrieval Error:", err);
    }

    // 4. Generate AI Response
    const systemMessage = systemPrompt(contextString);
    
    try {
      // Per TODO: Using @cf/meta/llama-3.1-8b-instruct
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
  if (!origin) return true; // Allow for non-browser tests
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim());
  return allowed.includes(origin);
}

function systemPrompt(context) {
  const base = `You are Chloe from BlueBush customer support. BlueBush is an eco-friendly homewares brand based in Perth, WA. 

Persona Guidelines:
- Role: You are a professional, educated employee of BlueBush.
- Tone: Helpful, transparent, grounded, and professional. 
- Style: Practical Australian English.
- Spelling: Use correct Australian English spelling at all times. Do NOT use slang spelling (e.g., use "doing" instead of "doin'", "you" instead of "ya"). 
- Vocabulary: Use terms like "No worries", "Cheers", or "Sorted" naturally and professionally.
- Directness: Provide direct answers. Do not start every response with a generic greeting unless appropriate.
- Information Retrieval Realism:
    - If you need to check specific details like stock levels, variant availability, or complex product specs (e.g., ingredients, dimensions), provide a "stalling" phrase first to show you are looking it up.
    - Format: Start these responses with "[STALL] I'll just check our current stock levels for you." or similar natural phrasing, followed by the answer.
- Constraints: Avoid "As an AI" or "I understand". Stay in character as Chloe.`;
  
  if (!context) return base;
  return `${base}\n\nUse this context to help answer accurately:\n${context}`;
}
