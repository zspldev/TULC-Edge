import { Router } from "express";
import { logger } from "../lib/logger";

const ttsRouter = Router();

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

// Sarvam bulbul:v3 hard limit: 500 characters per input element.
const MAX_CHUNK = 490; // stay a few chars under the limit

/** Split text into sentence-aware chunks that fit within MAX_CHUNK. */
function chunkText(text: string, maxLen = MAX_CHUNK): string[] {
  const parts = text.split(/(?<=[.?!।\n])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const part of parts) {
    const s = part.trim();
    if (!s) continue;

    if (s.length > maxLen) {
      // Sentence is itself too long — split at commas or spaces.
      if (current) { chunks.push(current); current = ""; }
      let remaining = s;
      while (remaining.length > maxLen) {
        let cut = remaining.lastIndexOf(",", maxLen);
        if (cut < maxLen * 0.5) cut = remaining.lastIndexOf(" ", maxLen);
        if (cut <= 0) cut = maxLen;
        chunks.push(remaining.slice(0, cut).trim());
        remaining = remaining.slice(cut).trim();
      }
      if (remaining) current = remaining;
    } else if (current && (current + " " + s).length > maxLen) {
      chunks.push(current);
      current = s;
    } else {
      current = current ? current + " " + s : s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.trim().length > 0);
}

const LANG_CODE: Record<string, string> = {
  mr: "mr-IN",
  en: "en-IN",
};

/**
 * POST /api/tts
 *
 * Converts text to speech using Sarvam Bulbul v3. Long text is automatically
 * split into ≤490-character chunks and sent as a single multi-input request;
 * the response `audios` array (one base64 WAV per chunk) is returned directly
 * so the mobile client can play them sequentially.
 *
 * Body:    { text: string, language: "en" | "mr" }
 * Returns: { audios: string[] }  — array of base64-encoded WAV strings
 */
ttsRouter.post("/tts", async (req, res) => {
  const { text, language } = req.body as { text?: string; language?: string };

  if (!text?.trim()) {
    res.status(400).json({ error: "'text' field is required" });
    return;
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "SARVAM_API_KEY not configured" });
    return;
  }

  const targetLang = LANG_CODE[language ?? "en"] ?? "en-IN";
  const inputs = chunkText(text.trim());

  if (inputs.length === 0) {
    res.json({ audios: [] });
    return;
  }

  try {
    const sarvamRes = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs,
        target_language_code: targetLang,
        speaker: "ishita",
        model: "bulbul:v3",
        enable_preprocessing: true,
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      throw new Error(`Sarvam TTS error ${sarvamRes.status}: ${errText}`);
    }

    const data = (await sarvamRes.json()) as { audios?: string[] };
    const audios = data.audios ?? [];

    logger.info(
      { chunks: inputs.length, totalChars: text.trim().length, lang: targetLang },
      "Speech synthesised via Sarvam"
    );

    res.json({ audios });
  } catch (err: any) {
    logger.error({ err }, "TTS error");
    res.status(502).json({ error: err?.message ?? "Speech synthesis failed" });
  }
});

export default ttsRouter;
