---
name: TULC OpenRouter proxy
description: OpenRouter model availability and constraints through Replit AI Integrations proxy
---

## Working model (as of August 2026)

`google/gemini-2.5-flash` — confirmed working through `AI_INTEGRATIONS_OPENROUTER_BASE_URL`.

## Does NOT work through Replit proxy

- `google/gemini-2.0-flash-001` — 404, no endpoints found
- `google/gemini-2.0-flash` — invalid model ID
- `google/gemini-flash-1.5` — no endpoints

## Also confirmed working

- `openai/gpt-4o-mini`
- `meta-llama/llama-3.1-8b-instruct`

## Constraints of Replit OpenRouter integration

- Chat completions only — NO audio transcription (Whisper), NO embeddings, NO image generation.
- Voice transcription requires direct OpenRouter key (`EXPO_PUBLIC_OPENROUTER_API_KEY`).
- `AI_INTEGRATIONS_OPENROUTER_API_KEY` is a dummy string — real auth is in `AI_INTEGRATIONS_OPENROUTER_BASE_URL`.

**Why:**
Replit proxy exposes a curated subset of OpenRouter's model catalog. Model IDs differ slightly from public OpenRouter names. Always test with a small request before deploying a new model.

**How to apply:**
When changing the LLM model in `artifacts/api-server/src/routes/coach.ts` (`TULC_MODEL` constant), test with the shell probe command first:
```bash
curl -s -X POST "${AI_INTEGRATIONS_OPENROUTER_BASE_URL}/chat/completions" \
  -H "Authorization: Bearer ${AI_INTEGRATIONS_OPENROUTER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"model":"MODEL_ID","messages":[{"role":"user","content":"Hi"}],"max_tokens":5}'
```
