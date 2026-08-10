import { Router } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { logger } from "../lib/logger";

const coachRouter = Router();

const TULC_MODEL = "google/gemini-2.5-flash";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CoachChatBody {
  messages: ChatMessage[];          // Full assembled message array (system + history + user)
  currentMode: string;              // For logging only
  subject?: string;
  chapter?: string;
}

/**
 * POST /api/coach/chat
 * Accepts a pre-assembled messages array from the mobile app.
 * Streams response as SSE back to the mobile client.
 *
 * SSE format:
 *   data: {"chunk":"..."}\n\n          — incremental text
 *   data: {"done":true}\n\n            — stream finished (full text in "text" field)
 *   data: {"error":"..."}\n\n          — error
 */
coachRouter.post("/coach/chat", async (req, res) => {
  const body = req.body as CoachChatBody;

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = await openrouter.chat.completions.create({
      model: TULC_MODEL,
      messages: body.messages,
      stream: true,
      max_tokens: 650,
      temperature: 0.7,
    });

    let fullText = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullText += content;
        sendEvent({ chunk: content });
      }
    }

    sendEvent({ done: true, text: fullText });
    res.end();
  } catch (err) {
    logger.error({ err }, "Coach chat error");
    sendEvent({ error: "OpenRouter request failed. Please try again." });
    res.end();
  }
});

/**
 * OPTIONS /api/coach/chat  — preflight for CORS from Expo web
 */
coachRouter.options("/coach/chat", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

export default coachRouter;
