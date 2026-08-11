import { Router } from "express";
import { logger } from "../lib/logger";

const ttsRouter = Router();

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

// Sarvam bulbul:v3 supports up to 2,500 characters per input.
const MAX_CHARS = 2500;

// Language → Sarvam target_language_code
const LANG_CODE: Record<string, string> = {
  mr: "mr-IN",
  en: "en-IN",
};

/**
 * POST /api/tts
 *
 * Converts text to speech using Sarvam Bulbul v3 — a high-quality
 * Indian-language TTS model that natively supports Marathi and Indian English.
 *
 * Body: { text: string, language: "en" | "mr" }
 * Response: { audio: "<base64-encoded WAV>" }
 *
 * The mobile client writes the base64 WAV to a temp file via expo-file-system
 * and plays it with expo-av.
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
  // Truncate to Sarvam's per-request limit
  const input = text.trim().slice(0, MAX_CHARS);

  try {
    const sarvamRes = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [input],
        target_language_code: targetLang,
        speaker: "ishita",   // Female, warm & soothing — ranked top for both en-IN and mr-IN
        model: "bulbul:v3",
        enable_preprocessing: true,
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      throw new Error(`Sarvam TTS error ${sarvamRes.status}: ${errText}`);
    }

    const data = (await sarvamRes.json()) as { audios?: string[] };
    const audio = data.audios?.[0] ?? "";

    logger.info(
      { chars: input.length, lang: targetLang, model: "bulbul:v3" },
      "Speech synthesised via Sarvam"
    );

    res.json({ audio });
  } catch (err: any) {
    logger.error({ err }, "TTS error");
    res.status(502).json({
      error: err?.message ?? "Speech synthesis failed — please try again",
    });
  }
});

export default ttsRouter;
