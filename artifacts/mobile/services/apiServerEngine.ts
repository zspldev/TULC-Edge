import { fetch } from 'expo/fetch';
import type { AIEngine, AIEngineRequest, AIEngineResponse, ChatMessage } from './aiTypes';
import { buildSystemPrompt, parseNextMode } from './coachEngine';
import { detectLanguage } from './languageDetect';

// ─────────────────────────────────────────────────────────────────
// API Server Engine
// Routes all coaching requests through the TULC API server,
// which holds the OpenRouter credentials server-side.
// ─────────────────────────────────────────────────────────────────

/**
 * Base URL of the TULC API server.
 * EXPO_PUBLIC_DOMAIN is injected by the Expo workflow as $REPLIT_DEV_DOMAIN.
 * The API server is routed at /api by the Replit proxy.
 */
function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    return `https://${domain}/api`;
  }
  // Fallback for local dev
  return 'http://localhost:8080/api';
}

export class APIServerEngine implements AIEngine {
  private apiBase: string;

  constructor() {
    this.apiBase = getApiBase();
  }

  isAvailable(): boolean {
    return true; // Always available — credentials are on the server
  }

  async generate(
    request: AIEngineRequest,
    onChunk?: (text: string) => void,
  ): Promise<AIEngineResponse> {
    const startTime = Date.now();

    // Build system prompt and assemble messages on the mobile side
    // (keeps all coaching logic in one place)
    const systemPrompt = buildSystemPrompt(request);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...request.conversationHistory.slice(-16),
      { role: 'user', content: request.studentQuestion },
    ];

    const body = {
      messages,
      currentMode: request.coachingInstruction.mode,
      subject: request.subject,
      chapter: request.chapter,
    };

    let rawText: string;

    if (onChunk) {
      rawText = await this.streamRequest(body, onChunk);
    } else {
      rawText = await this.simpleRequest(body);
    }

    const { cleanText, nextMode } = parseNextMode(rawText, request.coachingInstruction.mode);
    const responseLanguage = detectLanguage(cleanText);

    return {
      generatedText: cleanText,
      responseLanguage,
      nextMode,
      latencyMs: Date.now() - startTime,
    };
  }

  private async streamRequest(
    body: object,
    onChunk: (text: string) => void,
  ): Promise<string> {
    const response = await fetch(`${this.apiBase}/coach/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API server error ${response.status}: ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body from API server');

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.chunk) {
            fullText += parsed.chunk;
            onChunk(parsed.chunk);
          }
          // parsed.done signals stream end — fullText is already accumulated
        } catch (parseErr: any) {
          if (parseErr.message && !parseErr.message.includes('JSON')) {
            throw parseErr; // Re-throw real errors, not JSON parse failures
          }
        }
      }
    }

    return fullText;
  }

  private async simpleRequest(body: object): Promise<string> {
    // Collect all SSE chunks without streaming callback
    return this.streamRequest(body, () => {});
  }

  /**
   * Fetch curriculum context for a chapter from ZKE RAG (retrieve mode).
   *
   * Returns concatenated chunk text for use in the coaching prompt, or null
   * if ZKE has no results or the request fails — the coach screen then tells
   * the student the material is not yet loaded (per anti-hallucination rules).
   *
   * Query is written as a natural sentence (ZKE guide Section 6.2).
   * top_k 15 is the guide recommendation for concept-explanation queries (Section 6.3).
   */
  async fetchCurriculumContext(
    subject: string,
    chapterTitle: string,
    chapterId: string,
  ): Promise<string | null> {
    try {
      // Natural sentence query — ZKE guide explicitly warns against keyword lists (Section 6.2)
      const query =
        `What are all the concepts, definitions, formulas, and explanations ` +
        `covered in the chapter "${chapterTitle}" for Maharashtra SSC Standard 8 ${subject}?`;

      const response = await fetch(`${this.apiBase}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          subject,
          chapter: chapterId,
          top_k: 15, // Concept-explanation type (ZKE guide Section 6.3)
        }),
      });

      if (!response.ok) return null;

      const data = await response.json() as {
        context?: string;
        noResults?: boolean;
        source?: string;
      };

      // no_results means the topic isn't indexed yet — don't fabricate (guide Section 6.5)
      if (data.noResults) return null;

      return data.context && data.context.length > 50 ? data.context : null;
    } catch {
      return null;
    }
  }

  /**
   * Transcribe audio by uploading to the TULC API server, which calls
   * OpenRouter Whisper server-side (no client-side API key needed).
   *
   * @param audioUri  Local file URI returned by expo-av after recording
   * @param langHint  Optional BCP-47 language code hint (e.g. "mr", "en")
   */
  async transcribeAudio(audioUri: string, langHint?: string): Promise<string> {
    const formData = new FormData();

    // React Native accepts a plain object with uri/name/type as a FormData file part
    formData.append('audio', {
      uri: audioUri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);

    if (langHint) {
      formData.append('lang', langHint);
    }

    const response = await fetch(`${this.apiBase}/coach/transcribe`, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type manually — fetch sets it with the correct boundary
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(errData.error ?? `Transcription failed (${response.status})`);
    }

    const data = await response.json() as { text?: string };
    return data.text?.trim() ?? '';
  }
}

let serverEngineInstance: APIServerEngine | null = null;

export function getAPIServerEngine(): APIServerEngine {
  if (!serverEngineInstance) {
    serverEngineInstance = new APIServerEngine();
  }
  return serverEngineInstance;
}
