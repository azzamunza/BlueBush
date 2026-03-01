# BlueBush LLM Training Dataset

## Overview

This directory contains a supervised fine-tuning dataset for training (or adapting) a language model to act as the **BlueBush customer support chatbot**.

| File | Description |
|------|-------------|
| `bluebush-training.jsonl` | Primary training dataset — 600+ entries in chat format |

---

## Dataset Schema

Each line in `bluebush-training.jsonl` is a valid JSON object following the **OpenAI chat fine-tuning format**:

```json
{
  "messages": [
    { "role": "system",    "content": "..." },
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `messages` | array | Ordered list of chat turns |
| `messages[].role` | string | `"system"`, `"user"`, or `"assistant"` |
| `messages[].content` | string | The text of the message |

The **system** message sets the assistant persona:
> *"You are the BlueBush customer support assistant. BlueBush is a premium sustainable Australian homewares brand..."*

---

## Dataset Coverage

The dataset covers:

### A) Product Knowledge (~10 entries per product, 60+ products)
For every product in `data/products.json`:
- Product overview and marketing description
- Available variants (colours, sizes)
- Technical specifications
- Care & washing instructions
- Manual excerpts and troubleshooting tips
- Stock availability
- Pricing
- Origin and sustainability certifications
- Product image file paths (`images/products/...`)
- How to purchase

### B) Website & Support Scenarios
- Shipping costs and delivery times
- International shipping policy
- Order tracking
- Lost / damaged parcels
- Return and refund policy
- Exchange policy
- Order modification / cancellation
- Backorders and out-of-stock handling
- Payment methods (cards, Afterpay, PayPal, Zip)
- Gift cards
- Security and privacy
- Trade / wholesale enquiries

### C) Product Image Metadata
- Full list of image file paths in `images/products/`
- Image naming convention: `{PRODUCT_ID}-{Name}-{Variant}.png`
- Product-to-image mapping for all variants

### D) NVIDIA PersonaPlex (TODO placeholders)
The site targets a PersonaPlex-based "vibrational and voice LLM" as the base model.
Current entries include placeholder responses with `TODO` notes:
- Entry: *"What is NVIDIA PersonaPlex and how is it used for BlueBush?"*
- Entry: *"How is this dataset used to train the BlueBush chatbot?"*

> **TODO**: When official PersonaPlex documentation and integration specs are available,
> replace the placeholder entries with actual model details, fine-tuning parameters,
> and voice/personality configuration settings.

### E) Category Overviews
- Complete product listings per category (Bedroom, Bathroom, Dining, Kitchen, Living, etc.)

---

## How This Dataset Was Generated

The dataset is generated programmatically from:
- `data/products.json` — primary product catalogue (60 products)
- `migrations/001_initial_schema.sql` — FAQ seed data
- `images/products/` — image file enumeration
- `source/` — brand context and persona documentation

To regenerate the dataset after updating `data/products.json`, run:
```bash
python3 /tmp/gen_training.py
```
(See the generation script referenced in the project for the full implementation.)

---

## Usage

### OpenAI Fine-Tuning
```bash
openai api fine_tunes.create \
  -t training/bluebush-training.jsonl \
  -m gpt-3.5-turbo \
  --suffix "bluebush-chatbot"
```

### HuggingFace / TRL SFTTrainer
```python
from datasets import load_dataset
from trl import SFTTrainer

dataset = load_dataset("json", data_files="training/bluebush-training.jsonl", split="train")
# Use with your chosen base model + SFTTrainer
```

### NVIDIA PersonaPlex
> **TODO**: Integration instructions pending official PersonaPlex documentation.
> Once available, adapt the JSONL format as required by the PersonaPlex fine-tuning API.

---

## Statistics

| Metric | Value |
|--------|-------|
| Total entries | ~638 |
| Format | JSONL (chat) |
| Avg turns per entry | 3 (system + user + assistant) |
| Products covered | 60 |
| Support scenarios | 30+ |
| Image references | All variants in `images/products/` |

---

## Schema Version

Dataset schema version: `1.0`  
Generated from: `data/products.json` (v1)  
Last updated: 2026-03-01
