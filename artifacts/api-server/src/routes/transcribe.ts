import { Router } from "express";
import multer from "multer";
import { logger } from "../lib/logger";

const transcribeRouter = Router();

// Store upload in memory (audio clips are typically < 1 MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";

// BCP-47 hint → Sarvam language_code
const LANG_CODE: Record<string, string> = {
  mr: "mr-IN",
  en: "en-IN",
};

/**
 * POST /api/coach/transcribe
 *
 * Accepts a multipart audio upload from the mobile app and returns a
 * transcript using Sarvam Saaras v3 — optimised for Indian languages
 * (Marathi, Indian English, Hindi, etc.).
 *
 * Form fields:
 *   audio  — audio file (m4a / mp4 / webm / wav / aac / flac)
 *   lang   — optional language hint: "mr" | "en"
 */
transcribeRouter.post("/coach/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No audio file uploaded (field name must be 'audio')" });
    return;
  }

  const langHint = (req.body?.lang as string | undefined) ?? undefined;
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "SARVAM_API_KEY not configured" });
    return;
  }

  try {
    // Forward the audio buffer to Sarvam as multipart/form-data.
    // Node 24 ships native FormData + Blob — no extra packages needed.
    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || "audio/m4a" });
    form.append("file", blob, req.file.originalname || "audio.m4a");
    form.append("model", "saaras:v3");
    form.append("mode", "transcribe");
    if (langHint && LANG_CODE[langHint]) {
      form.append("language_code", LANG_CODE[langHint]);
    }

    const sarvamRes = await fetch(SARVAM_STT_URL, {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: form,
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      throw new Error(`Sarvam STT error ${sarvamRes.status}: ${errText}`);
    }

    const data = (await sarvamRes.json()) as { transcript?: string };
    const text = data.transcript?.trim() ?? "";

    logger.info(
      { chars: text.length, lang: langHint ?? "auto", model: "saaras:v3" },
      "Audio transcribed via Sarvam"
    );

    res.json({ text });
  } catch (err: any) {
    logger.error({ err }, "Transcription error");
    res.status(502).json({
      error: err?.message ?? "Transcription failed — please try again",
    });
  }
});

transcribeRouter.options("/coach/transcribe", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

export default transcribeRouter;
