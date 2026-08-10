import { Router } from "express";
import multer from "multer";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { logger } from "../lib/logger";

const transcribeRouter = Router();

// Store upload in memory (audio clips are small — typically < 1 MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/coach/transcribe
 *
 * Accepts a multipart audio upload from the mobile app and returns a
 * transcript using OpenRouter's Whisper large-v3 model.
 *
 * Form fields:
 *   audio  — audio file (m4a/mp4/webm/wav)
 *   lang   — optional BCP-47 language hint (e.g. "mr" for Marathi, "en" for English)
 */
transcribeRouter.post("/coach/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No audio file uploaded (field name must be 'audio')" });
    return;
  }

  const languageHint = (req.body?.lang as string | undefined) ?? undefined;

  try {
    // Wrap the Buffer in a File so the OpenAI SDK can upload it
    const mimeType = req.file.mimetype || "audio/m4a";
    const filename = req.file.originalname || "audio.m4a";
    const audioFile = new File([req.file.buffer], filename, { type: mimeType });

    const transcription = await openrouter.audio.transcriptions.create({
      model: "openai/whisper-large-v3",
      file: audioFile,
      ...(languageHint ? { language: languageHint } : {}),
    });

    logger.info(
      { chars: transcription.text.length, lang: languageHint },
      "Audio transcribed"
    );

    res.json({ text: transcription.text });
  } catch (err: any) {
    logger.error({ err }, "Transcription error");
    // Surface a clear message so the mobile client can show it
    res.status(502).json({
      error: err?.message ?? "Transcription failed — please try again",
    });
  }
});

/**
 * OPTIONS /api/coach/transcribe — CORS preflight
 */
transcribeRouter.options("/coach/transcribe", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

export default transcribeRouter;
