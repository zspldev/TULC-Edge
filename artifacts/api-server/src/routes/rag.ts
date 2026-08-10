import { Router } from "express";
import { logger } from "../lib/logger";

const ragRouter = Router();

const ZKE_BASE_URL = process.env.ZKE_BASE_URL ?? "https://zkengine.replit.app";
const ZKE_PROJECT_ID = process.env.ZKE_PROJECT_ID ?? "9";
const ZKE_API_KEY = process.env.ZKE_API_KEY ?? "";

interface RagQueryBody {
  query: string;       // The question or topic to retrieve context for
  subject?: string;    // For logging
  chapter?: string;    // For logging
}

/**
 * POST /api/rag/query
 * Queries ZKE RAG for curriculum context relevant to a topic/question.
 * Returns the synthesised answer as `context` for use in the coaching prompt.
 */
ragRouter.post("/rag/query", async (req, res) => {
  const body = req.body as RagQueryBody;

  if (!body.query || typeof body.query !== "string") {
    res.status(400).json({ error: "query is required" });
    return;
  }

  if (!ZKE_API_KEY) {
    res.status(503).json({ error: "ZKE_API_KEY is not configured" });
    return;
  }

  try {
    const endpoint = `${ZKE_BASE_URL}/api/v1/projects/${ZKE_PROJECT_ID}/query`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": ZKE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: body.query,
        mode: "answer",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error({ status: response.status, errText }, "ZKE query failed");
      res.status(502).json({ error: "RAG query failed", detail: errText });
      return;
    }

    const data = await response.json() as {
      answer?: string;
      chunks?: Array<{ content: string; score?: number }>;
      model_used?: string;
      embedding_cost_usd?: number;
      llm_cost_usd?: number;
    };

    // Use `answer` if present (mode=answer), fall back to concatenated chunks (mode=retrieve)
    const context =
      data.answer ??
      data.chunks?.map((c) => c.content).join("\n\n") ??
      "";

    if (!context) {
      logger.warn({ body }, "ZKE returned empty context");
      res.json({ context: "", source: "zke_empty" });
      return;
    }

    logger.info(
      { subject: body.subject, chapter: body.chapter, chars: context.length },
      "ZKE context retrieved"
    );

    res.json({ context, source: "zke" });
  } catch (err) {
    logger.error({ err }, "ZKE request error");
    res.status(502).json({ error: "Failed to reach ZKE RAG service" });
  }
});

export default ragRouter;
