---
name: TULC architecture
description: Core architectural decisions for TULC — The Ultimate Learning Coach mobile app
---

## Key decisions

- **Monorepo**: single pnpm workspace. Mobile app at `artifacts/mobile`, API server at `artifacts/api-server`.
- **Mobile**: Expo SDK 54, Expo Go compatible (no native build for MVP). expo-av for voice (deprecated in SDK 54 — migrate to expo-audio later).
- **LLM routing**: Mobile app calls `artifacts/api-server` at `/api/coach/chat` (SSE). Server holds OpenRouter credentials via Replit integration. Mobile app also supports direct OpenRouter when `EXPO_PUBLIC_OPENROUTER_API_KEY` is set (unlocks Whisper voice transcription).
- **API server path**: Routed at `/api` by Replit proxy → port 8080. Full URL: `https://${REPLIT_DEV_DOMAIN}/api/...`. Mobile uses `EXPO_PUBLIC_DOMAIN` env var (injected as `$REPLIT_DEV_DOMAIN` in Expo workflow).
- **No backend DB for MVP**: All persistence via AsyncStorage (profile, sessions, weak concepts, chapter progress).
- **9 coaching modes**: explain → quiz → evaluate → teachBack/remediate cycle. LLM signals next mode via `[NEXT_MODE:xxx]` tag stripped before display.
- **Language detection**: Devanagari Unicode range check (no cloud call). Student can override with "in English" / "in Marathi" phrases.
- **Subjects**: Science + Maths, Std 8 SSC Maharashtra, 14 chapters each. Placeholder context in `constants/curriculum.ts` until real RAG provided.
- **RAG**: stub only — user will provide connection details. Only `services/ragService.ts` needs updating when RAG arrives.

**Why:**
Designed for offline-capable Expo Go testing on iPhone 15 + Android without native builds. Server-side credentials avoid exposing API keys in the mobile bundle.
