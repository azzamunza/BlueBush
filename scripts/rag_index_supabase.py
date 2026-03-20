#!/usr/bin/env python3
"""
rag_index_supabase.py — BlueBush RAG pipeline, Step 2

Reads `products` and `kb_entries` from Supabase, builds embeddable text for
each record, calls the NVIDIA embeddings endpoint, then upserts the results
(with embeddings) into the `rag_documents` table.

Usage:
    # Full re-index:
    python scripts/rag_index_supabase.py

    # Index only products:
    python scripts/rag_index_supabase.py --source products

    # Index only kb_entries:
    python scripts/rag_index_supabase.py --source kb_entries

    # Embed a query and show top-5 matches (does NOT re-index):
    python scripts/rag_index_supabase.py --test-query "do you sell gift cards?"

Environment variables required:
    SUPABASE_URL                  e.g. https://xxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY     service-role secret key (server-side only)
    NVIDIA_API_KEY                your NVIDIA API key (nvapi-…)

Optional environment variables:
    NVIDIA_EMBEDDINGS_URL         default: https://integrate.api.nvidia.com/v1/embeddings
    NVIDIA_EMBEDDINGS_MODEL       default: nvidia/llama-3_2-nemoretriever-300m-embed-v1
"""

import argparse
import hashlib
import json
import os
import sys
import time
from typing import Optional

import requests
from supabase import create_client, Client


# ---------------------------------------------------------------------------
# Configuration defaults
# ---------------------------------------------------------------------------

DEFAULT_EMBEDDINGS_URL = "https://integrate.api.nvidia.com/v1/embeddings"
DEFAULT_EMBEDDINGS_MODEL = "nvidia/llama-3_2-nemoretriever-300m-embed-v1"

EMBED_BATCH_SIZE = 16          # NVIDIA allows up to 32; keep conservative
UPSERT_BATCH_SIZE = 50
RETRY_ATTEMPTS = 3
RETRY_DELAY_S = 2.0
EMBED_DIM = 2048


# ---------------------------------------------------------------------------
# Helpers — environment
# ---------------------------------------------------------------------------

def get_env(name: str, default: Optional[str] = None) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        if default is not None:
            return default
        print(f"ERROR: environment variable '{name}' is not set.", file=sys.stderr)
        sys.exit(1)
    return value


# ---------------------------------------------------------------------------
# Helpers — hashing
# ---------------------------------------------------------------------------

def stable_id(source_type: str, source_id: str) -> str:
    """Return a stable SHA-256-derived text ID for a (source_type, source_id) pair."""
    raw = f"{source_type}:{source_id}"
    return hashlib.sha256(raw.encode()).hexdigest()[:40]


# ---------------------------------------------------------------------------
# Supabase data fetching
# ---------------------------------------------------------------------------

def fetch_all(sb: Client, table: str, columns: str = "*") -> list[dict]:
    """Paginate through a Supabase table and return all rows."""
    rows: list[dict] = []
    start = 0
    page_size = 1000
    while True:
        resp = sb.table(table).select(columns).range(start, start + page_size - 1).execute()
        batch = resp.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return rows


# ---------------------------------------------------------------------------
# Document builders — convert DB rows to embeddable text
# ---------------------------------------------------------------------------

def _list_to_text(items: list | None) -> str:
    """Flatten a list of strings (or JSONB string-arrays) to a comma-separated string."""
    if not items:
        return ""
    return ", ".join(str(i) for i in items if i)


def product_to_doc(product: dict) -> dict:
    """Build the embeddable document dict for a single product row."""
    parts: list[str] = []

    name = product.get("name") or ""
    category = product.get("category") or ""
    parts.append(f"Product: {name}")
    if category:
        parts.append(f"Category: {category}")

    hook = product.get("marketing_hook") or product.get("variant_marketing_hook") or ""
    if hook:
        parts.append(f"Description: {hook}")

    eco = product.get("eco_badge") or ""
    if eco:
        parts.append(f"Eco badge: {eco}")

    origin = product.get("origin") or ""
    if origin:
        parts.append(f"Origin: {origin}")

    # technical_specs — JSONB array of strings
    specs = product.get("technical_specs") or []
    if isinstance(specs, list) and specs:
        parts.append("Technical specs: " + _list_to_text(specs))

    # care_instructions — JSONB array of strings
    care = product.get("care_instructions") or []
    if isinstance(care, list) and care:
        parts.append("Care instructions: " + _list_to_text(care))

    manual = product.get("manual_excerpt") or ""
    if manual:
        parts.append(f"Manual: {manual}")

    price = product.get("price_aud")
    if price is not None:
        parts.append(f"Price: AUD ${price}")

    status = product.get("status") or ""
    if status:
        parts.append(f"Status: {status}")

    content = "\n".join(parts).strip()
    title = name or product.get("id", "")

    updated_at = product.get("updated_at")

    return {
        "id": stable_id("products", str(product["id"])),
        "source_type": "products",
        "source_id": str(product["id"]),
        "title": title[:255],
        "content": content,
        "source_updated_at": updated_at,
    }


def kb_entry_to_doc(entry: dict) -> dict:
    """Build the embeddable document dict for a single kb_entries row."""
    slug = entry.get("slug", "")
    title = entry.get("title") or slug
    content_parts = [f"Title: {title}"]
    body = (entry.get("content") or "").strip()
    if body:
        content_parts.append(body)
    tags = entry.get("tags") or []
    if tags:
        content_parts.append("Tags: " + ", ".join(tags))

    content = "\n".join(content_parts).strip()
    updated_at = entry.get("updated_at")

    return {
        "id": stable_id("kb_entries", slug),
        "source_type": "kb_entries",
        "source_id": slug,
        "title": title[:255],
        "content": content,
        "source_updated_at": updated_at,
    }


# ---------------------------------------------------------------------------
# NVIDIA Embeddings
# ---------------------------------------------------------------------------

class EmbeddingClient:
    def __init__(self, api_key: str, url: str, model: str) -> None:
        self.api_key = api_key
        self.url = url
        self.model = model

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Call the NVIDIA embeddings endpoint and return a list of vectors."""
        if not texts:
            return []

        payload = {
            "model": self.model,
            "input": texts,
            "input_type": "passage",  # 'passage' for documents; use 'query' for queries
            "encoding_format": "float",
        }

        last_error: Exception | None = None
        for attempt in range(1, RETRY_ATTEMPTS + 1):
            try:
                resp = requests.post(
                    self.url,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}",
                    },
                    json=payload,
                    timeout=60,
                )
                resp.raise_for_status()
                data = resp.json()
                # OpenAI-compatible response: data["data"] is a list sorted by index
                vectors = [item["embedding"] for item in sorted(data["data"], key=lambda x: x["index"])]
                return vectors
            except Exception as exc:
                last_error = exc
                print(
                    f"  WARNING: Embedding attempt {attempt}/{RETRY_ATTEMPTS} failed: {exc}",
                    file=sys.stderr,
                )
                if attempt < RETRY_ATTEMPTS:
                    time.sleep(RETRY_DELAY_S * attempt)

        raise RuntimeError(f"Embedding failed after {RETRY_ATTEMPTS} attempts: {last_error}")

    def embed_query(self, query: str) -> list[float]:
        """Embed a single query string (uses input_type='query')."""
        payload = {
            "model": self.model,
            "input": [query],
            "input_type": "query",
            "encoding_format": "float",
        }
        resp = requests.post(
            self.url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["data"][0]["embedding"]


# ---------------------------------------------------------------------------
# Indexing
# ---------------------------------------------------------------------------

def index_documents(
    sb: Client,
    embed_client: EmbeddingClient,
    docs: list[dict],
    source_label: str,
) -> None:
    """Embed `docs` in batches and upsert into rag_documents."""
    total = len(docs)
    if total == 0:
        print(f"  No {source_label} documents to index.")
        return

    print(f"  Embedding {total} {source_label} documents (batch_size={EMBED_BATCH_SIZE}) …")
    records: list[dict] = []

    for i in range(0, total, EMBED_BATCH_SIZE):
        batch = docs[i : i + EMBED_BATCH_SIZE]
        texts = [d["content"] for d in batch]
        print(f"    Embedding {i + 1}–{min(i + EMBED_BATCH_SIZE, total)} / {total} …")
        vectors = embed_client.embed(texts)

        for doc, vector in zip(batch, vectors):
            if len(vector) != EMBED_DIM:
                print(
                    f"  WARNING: expected {EMBED_DIM}-dim vector, got {len(vector)} for {doc['id']}",
                    file=sys.stderr,
                )
            record = dict(doc)
            record["embedding"] = vector
            records.append(record)

    print(f"  Upserting {len(records)} records into rag_documents …")
    upserted = 0
    for j in range(0, len(records), UPSERT_BATCH_SIZE):
        batch = records[j : j + UPSERT_BATCH_SIZE]
        sb.table("rag_documents").upsert(batch, on_conflict="id").execute()
        upserted += len(batch)
        print(f"    Upserted {upserted}/{len(records)} …")

    print(f"  Done indexing {source_label}.")


# ---------------------------------------------------------------------------
# Test-query mode
# ---------------------------------------------------------------------------

def run_test_query(sb: Client, embed_client: EmbeddingClient, query: str) -> None:
    """Embed a query and call match_rag_documents to show top hits."""
    print(f"\nTest query: \"{query}\"")
    print("Embedding query …")
    query_vector = embed_client.embed_query(query)
    print(f"  Vector dimension: {len(query_vector)}")

    print("Calling match_rag_documents RPC …")
    resp = sb.rpc(
        "match_rag_documents",
        {
            "query_embedding": query_vector,
            "match_count": 5,
            "source_filter": None,
        },
    ).execute()

    results = resp.data or []
    if not results:
        print("  No results returned (table may be empty or RPC not found).")
        return

    print(f"\n  Top {len(results)} results:")
    for rank, hit in enumerate(results, 1):
        score = hit.get("score", 0)
        title = hit.get("title", "")
        source_type = hit.get("source_type", "")
        source_id = hit.get("source_id", "")
        content_preview = (hit.get("content") or "")[:120].replace("\n", " ")
        print(f"  [{rank}] score={score:.4f}  [{source_type}/{source_id}]  {title}")
        print(f"       {content_preview} …")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Index BlueBush products and kb_entries into Supabase rag_documents with NVIDIA embeddings."
    )
    parser.add_argument(
        "--source",
        choices=["products", "kb_entries", "all"],
        default="all",
        help="Which source type to index (default: all).",
    )
    parser.add_argument(
        "--test-query",
        metavar="QUERY",
        help="Embed a query string and print top-5 matches from rag_documents (no re-indexing).",
    )
    args = parser.parse_args()

    supabase_url = get_env("SUPABASE_URL")
    service_key = get_env("SUPABASE_SERVICE_ROLE_KEY")
    nvidia_api_key = get_env("NVIDIA_API_KEY")
    embed_url = get_env("NVIDIA_EMBEDDINGS_URL", DEFAULT_EMBEDDINGS_URL)
    embed_model = get_env("NVIDIA_EMBEDDINGS_MODEL", DEFAULT_EMBEDDINGS_MODEL)

    sb: Client = create_client(supabase_url, service_key)
    embed_client = EmbeddingClient(api_key=nvidia_api_key, url=embed_url, model=embed_model)

    # Test-query mode — no re-indexing
    if args.test_query:
        run_test_query(sb, embed_client, args.test_query)
        return

    # ── Products ────────────────────────────────────────────────────────────
    if args.source in ("products", "all"):
        print("Fetching products from Supabase …")
        products = fetch_all(sb, "products")
        print(f"  {len(products)} products fetched.")
        product_docs = [product_to_doc(p) for p in products]
        index_documents(sb, embed_client, product_docs, "products")

    # ── KB Entries ──────────────────────────────────────────────────────────
    if args.source in ("kb_entries", "all"):
        print("Fetching kb_entries from Supabase …")
        kb_entries = fetch_all(sb, "kb_entries")
        print(f"  {len(kb_entries)} kb_entries fetched.")
        kb_docs = [kb_entry_to_doc(e) for e in kb_entries]
        index_documents(sb, embed_client, kb_docs, "kb_entries")

    print("\nIndexing complete.")


if __name__ == "__main__":
    main()
