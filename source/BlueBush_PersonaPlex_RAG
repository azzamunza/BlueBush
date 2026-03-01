# BlueBush AI: PersonaPlex RAG & Implementation Guide

## 1. System Architecture
The assistant uses a **Dual-Stream** approach. Unlike traditional bots, PersonaPlex processes audio and text concurrently, allowing it to "hear" while "speaking."

[Image of NVIDIA PersonaPlex Dual-Stream Architecture]

## 2. BlueBush System Prompt
This prompt is injected into the model's text stream to define its behavior and context.

```text
Role: You are the BlueBush Virtual Assistant.
Persona: Friendly, eco-conscious, Australian casual.
Task: Assist customers with sustainable product choices using provided store data.
Constraints: Use only the provided context for technical specs. If unknown, offer a call-back.
Context: {retrieved_context}
```

## 3. RAG Implementation (Python)
The following snippet demonstrates how to query a vector database (Milvus/Pinecone) and feed the result into the PersonaPlex text stream.

```python
import os
import asyncio
import numpy as np
from nvidia_rag import RetrieverClient # Hypothetical SDK for 2026 NIM
from personaplex import PersonaPlexClient

# Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
STORE_COLLECTION = "bluebush_inventory"

async def get_store_context(query_text):
    """
    Retrieves relevant product data from the BlueBush vector database.
    """
    retriever = RetrieverClient(api_key=NVIDIA_API_KEY)
    results = await retriever.search(
        collection=STORE_COLLECTION,
        query=query_text,
        limit=3
    )
    # Combine results into a single string for the prompt
    return "\n".join([r.text for r in results])

async def run_voice_session(user_audio_stream):
    """
    Main loop for the full-duplex voice bot.
    """
    client = PersonaPlexClient(api_key=NVIDIA_API_KEY)
    
    # Initialize with BlueBush Voice and Text Prompts
    session = await client.connect(
        voice_prompt="bluebush_warm_voice.pt", # Pre-trained voice embedding
        system_prompt="You are the BlueBush Assistant. Help customers with eco-products."
    )

    async for chunk in user_audio_stream:
        # 1. Get transcription of recent audio (PersonaPlex provides this in-stream)
        user_text = await session.get_latest_transcript()
        
        if user_text:
            # 2. Perform RAG lookup based on what the user said
            context = await get_store_context(user_text)
            
            # 3. Update the model's internal context mid-stream
            await session.update_text_prompt(f"Current Store Data: {context}")

        # 4. Stream response audio back to the caller (e.g., Twilio)
        response_audio = await session.generate_audio(chunk)
        yield response_audio

if __name__ == "__main__":
    print("BlueBush Voice Bot Initialized...")
    # Integration with Twilio WebSockets would call run_voice_session here.
```

## 4. Telephony Integration (Twilio)
To connect this to a phone line:
1. **Twilio <Stream>:** Fork the call audio to your WebSocket server.
2. **Buffer:** Collect 20ms chunks of audio.
3. **Inference:** Pass chunks to the `run_voice_session` loop above.
4. **Playback:** Stream the returned audio tokens back to the Twilio WebSocket.

## 5. Summary Table

| Component | Technology |
| :--- | :--- |
| **Model** | PersonaPlex-7B (NVIDIA) |
| **Orchestration** | Python / LangGraph |
| **Database** | Milvus (Vector DB) |
| **Telephony** | Twilio Media Streams |
| **GPU** | NVIDIA H100 (Cloud/On-Prem) |
