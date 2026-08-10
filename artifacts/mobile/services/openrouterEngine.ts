import { fetch } from 'expo/fetch';
import type { AIEngine, AIEngineRequest, AIEngineResponse } from './aiTypes';
import { buildSystemPrompt, parseNextMode } from './coachEngine';
import { detectLanguage } from './languageDetect';
import { getAPIServerEngine } from './apiServerEngine';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';
const WHISPER_MODEL = 'openai/whisper-large-v3';

// ─────────────────────────────────────────────────────────────────
// OpenRouter AI Engine — direct API calls (requires user API key)
// Used only when EXPO_PUBLIC_OPENROUTER_API_KEY is set.
// ─────────────────────────────────────────────────────────────────

export class OpenRouterAIEngine implements AIEngine {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  isAvailable(): boolean {
    return this.apiKey.length > 10;
  }

  async generate(
    request: AIEngineRequest,
    onChunk?: (text: string) => void,
  ): Promise<AIEngineResponse> {
    const startTime = Date.now();
    const systemPrompt = buildSystemPrompt(request);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...request.conversationHistory.slice(-16),
      { role: 'user', content: request.studentQuestion },
    ];

    let rawText: string;
    if (onChunk) {
      rawText = await this.streamGenerate(messages as any, onChunk);
    } else {
      rawText = await this.simpleGenerate(messages as any);
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

  private async streamGenerate(
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
  ): Promise<string> {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tulc.zapurzaasystems.com',
        'X-Title': 'TULC - The Ultimate Learning Coach',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        max_tokens: 650,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body from OpenRouter');

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
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch {
          // Ignore malformed SSE lines
        }
      }
    }

    return fullText;
  }

  private async simpleGenerate(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tulc.zapurzaasystems.com',
        'X-Title': 'TULC - The Ultimate Learning Coach',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        max_tokens: 650,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('model', WHISPER_MODEL);

    const response = await fetch(`${OPENROUTER_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://tulc.zapurzaasystems.com',
        'X-Title': 'TULC - The Ultimate Learning Coach',
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Whisper error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.text?.trim() ?? '';
  }
}

// ─────────────────────────────────────────────────────────────────
// Engine selector
// Priority: direct OpenRouter key (with voice) → API server proxy
// ─────────────────────────────────────────────────────────────────

let engineInstance: AIEngine | null = null;

export function getAIEngine(): AIEngine {
  if (!engineInstance) {
    const directKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? '';
    if (directKey.length > 10) {
      // User has their own key — use direct engine (voice transcription supported)
      engineInstance = new OpenRouterAIEngine(directKey);
    } else {
      // Use the API server proxy (Replit-managed credentials, no voice)
      engineInstance = getAPIServerEngine();
    }
  }
  return engineInstance;
}

/**
 * Returns true if the active engine supports voice transcription.
 * The API server engine now proxies Whisper server-side, so voice is
 * always supported on native (web is excluded by the ChatInput component).
 */
export function voiceSupported(): boolean {
  return true;
}
