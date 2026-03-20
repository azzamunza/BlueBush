#!/usr/bin/env python3
"""
build_kb_entries.py — BlueBush RAG pipeline, Step 1

Reads kb/kb_seed.yml (and optionally transforms FAQs from Supabase) then
upserts everything into the `kb_entries` Supabase table.

Usage:
    python scripts/build_kb_entries.py [--include-faqs] [--dry-run]

Environment variables required:
    SUPABASE_URL              e.g. https://xxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY service-role secret key (server-side only)

Options:
    --include-faqs   Also pull the `faqs` table from Supabase and convert
                     each row to a kb_entries entry (slug: faq-<id>).
    --dry-run        Print what would be upserted without writing to Supabase.
"""

import argparse
import os
import sys
from pathlib import Path

import yaml
from supabase import create_client, Client


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"ERROR: environment variable '{name}' is not set.", file=sys.stderr)
        sys.exit(1)
    return value


def load_seed(seed_path: Path) -> list[dict]:
    """Load and validate kb/kb_seed.yml entries."""
    with seed_path.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    entries = data.get("entries", [])
    if not isinstance(entries, list):
        print("ERROR: kb_seed.yml must have a top-level 'entries' list.", file=sys.stderr)
        sys.exit(1)
    return entries


def faq_to_kb_entry(faq: dict) -> dict:
    """Convert a Supabase `faqs` row to a kb_entries dict."""
    faq_id = faq.get("id")
    question = (faq.get("question") or "").strip()
    answer = (faq.get("answer") or "").strip()
    category = (faq.get("category") or "General").strip()

    content = f"Q: {question}\nA: {answer}"

    return {
        "slug": f"faq-{faq_id}",
        "title": question[:120],  # truncate for title
        "content": content,
        "tags": [category.lower().replace(" ", "-")],
        "source": "faq",
        "source_id": str(faq_id),
    }


def fetch_faqs(sb: Client) -> list[dict]:
    """Fetch all rows from the Supabase `faqs` table."""
    rows = []
    start = 0
    page_size = 1000
    while True:
        resp = sb.table("faqs").select("*").range(start, start + page_size - 1).execute()
        batch = resp.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        start += page_size
    return rows


def build_records(seed_entries: list[dict], faq_entries: list[dict]) -> list[dict]:
    """Merge seed + FAQ entries, deduplicating by slug (seed wins)."""
    seen: dict[str, dict] = {}
    # Seed entries first (higher priority)
    for entry in seed_entries:
        slug = entry.get("slug", "").strip()
        if not slug:
            print(f"WARNING: skipping seed entry with missing slug: {entry}", file=sys.stderr)
            continue
        seen[slug] = {
            "slug": slug,
            "title": (entry.get("title") or "").strip(),
            "content": (entry.get("content") or "").strip(),
            "tags": entry.get("tags") or [],
            "source": (entry.get("source") or "manual").strip(),
            "source_id": entry.get("source_id"),
        }
    # FAQ entries (do not overwrite seed entries)
    for entry in faq_entries:
        slug = entry["slug"]
        if slug not in seen:
            seen[slug] = entry
    return list(seen.values())


def upsert_records(sb: Client, records: list[dict]) -> None:
    """Upsert records into kb_entries in batches of 100."""
    batch_size = 100
    total = len(records)
    upserted = 0
    for i in range(0, total, batch_size):
        batch = records[i : i + batch_size]
        resp = sb.table("kb_entries").upsert(batch, on_conflict="slug").execute()
        upserted += len(batch)
        print(f"  Upserted {upserted}/{total} records …")
    print(f"Done. {total} kb_entries upserted.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build and upsert kb_entries from kb/kb_seed.yml (and optionally faqs)."
    )
    parser.add_argument(
        "--include-faqs",
        action="store_true",
        help="Also pull FAQs from Supabase and add them as kb_entries.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print records that would be upserted without writing to Supabase.",
    )
    args = parser.parse_args()

    # Locate kb_seed.yml relative to this script
    repo_root = Path(__file__).resolve().parent.parent
    seed_path = repo_root / "kb" / "kb_seed.yml"
    if not seed_path.exists():
        print(f"ERROR: seed file not found: {seed_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Loading seed file: {seed_path}")
    seed_entries = load_seed(seed_path)
    print(f"  {len(seed_entries)} entries loaded from seed file.")

    faq_entries: list[dict] = []

    # Create Supabase client only when required (not for seed-only dry-runs)
    sb: Client | None = None
    if args.include_faqs or not args.dry_run:
        supabase_url = get_env("SUPABASE_URL")
        service_key = get_env("SUPABASE_SERVICE_ROLE_KEY")
        sb = create_client(supabase_url, service_key)

    if args.include_faqs:
        print("Fetching FAQs from Supabase …")
        faqs = fetch_faqs(sb)
        faq_entries = [faq_to_kb_entry(f) for f in faqs]
        print(f"  {len(faq_entries)} FAQ entries converted.")

    records = build_records(seed_entries, faq_entries)
    print(f"Total records to upsert: {len(records)}")

    if args.dry_run:
        print("\n--- DRY RUN (not writing to Supabase) ---")
        for rec in records:
            print(f"  [{rec['slug']}] {rec['title'][:60]}")
        return

    print("Upserting into kb_entries …")
    upsert_records(sb, records)


if __name__ == "__main__":
    main()
