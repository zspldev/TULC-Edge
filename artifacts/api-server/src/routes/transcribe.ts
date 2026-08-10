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
    // Encode audio buffer as base64 and send to Gemini as a multimodal message.
    // Gemini 2.5 Flash supports audio transcription via the OpenAI-compatible
    // chat completions API; Whisper is not available through the Replit proxy.
    const mimeType = (req.file.mimetype || "audio/m4a") as string;
    const base64Audio = req.file.buffer.toString("base64");

    const languageInstruction = languageHint
      ? `The audio may be in language "${languageHint}" (BCP-47 code). `
      : "";

    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_audio",
              // @ts-expect-error — OpenRouter/Gemini multimodal audio extension; not yet in OpenAI typedefs
              input_audio: {
                data: base64Audio,
                format: mimeType.replace("audio/", ""), // "m4a", "mp4", "webm", etc.
              },
            },
            {
              type: "text",
              text:
                `${languageInstruction}` +
                "Transcribe this audio exactly as spoken. " +
                "Return ONLY the transcription — no explanations, no punctuation corrections, no extra text.",
            },
          ],
        },
      ],
      max_tokens: 500,
    } as any);

    const text = completion.choices[0]?.message?.content?.trim() ?? "";

    logger.info(
      { chars: text.length, lang: languageHint, model: "gemini-2.5-flash" },
      "Audio transcribed via Gemini"
    );

    res.json({ text });
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
