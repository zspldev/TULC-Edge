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
   * Voice transcription is not supported through the API server proxy.
   * The mobile app should hide the mic button when using APIServerEngine.
   */
  async transcribeAudio(_audioUri: string): Promise<string> {
    throw new Error('Voice transcription requires a direct OpenRouter API key. Set EXPO_PUBLIC_OPENROUTER_API_KEY to enable voice.');
  }
}

let serverEngineInstance: APIServerEngine | null = null;

export function getAPIServerEngine(): APIServerEngine {
  if (!serverEngineInstance) {
    serverEngineInstance = new APIServerEngine();
  }
  return serverEngineInstance;
}
