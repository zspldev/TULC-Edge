import { Router } from "express";
import { logger } from "../lib/logger";

const ragRouter = Router();

const ZKE_BASE_URL = process.env.ZKE_BASE_URL ?? "https://zkengine.replit.app";
const ZKE_PROJECT_ID = process.env.ZKE_PROJECT_ID ?? "9";
const ZKE_API_KEY = process.env.ZKE_API_KEY ?? "";

interface RagQueryBody {
  query: string;    // Natural-language question or topic
  subject?: string; // For logging only
  chapter?: string; // For logging only
  top_k?: number;   // Optional override; defaults to 15
}

// ZKE retrieve-mode chunk shape (per API guide Section 4a)
interface ZkeChunk {
  content: string;
  document_name: string;
  document_id: number;
  chunk_index: number;
  similarity_score: number;
}

// ZKE retrieve-mode response (per API guide Section 4a)
interface ZkeRetrieveResponse {
  chunks: ZkeChunk[];
  no_results?: boolean;
  embedding_cost_usd: number;
}

/**
 * POST /api/rag/query
 *
 * Queries ZKE in retrieve mode and returns concatenated chunk text as
 * `context` for the TULC coaching prompt.
 *
 * We use retrieve (not answer) because we build our own coaching prompt
 * around the content — see ZKE guide Section 6.4.
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

    // top_k: 15 is the guide recommendation for concept-explanation queries.
    // Caller can override via body.top_k for narrower (specific fact: 5) or
    // broader (list all topics: 20) queries.
    const top_k = body.top_k ?? 15;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        // ZKE live API uses x-api-key (guide specifies Authorization: Bearer
        // but the deployed endpoint does not honour it yet)
        "x-api-key": ZKE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: body.query,
        mode: "retrieve",   // retrieve = raw chunks; we build our own prompt (guide Section 6.4)
        top_k,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      const status = response.status;
      logger.error({ status, errText, query: body.query }, "ZKE query failed");

      // Map ZKE HTTP errors to informative messages (guide Section 7)
      if (status === 401 || status === 403) {
        res.status(502).json({ error: "ZKE authentication failed — check ZKE_API_KEY" });
      } else if (status === 404) {
        res.status(502).json({ error: "ZKE project not found — check ZKE_PROJECT_ID" });
      } else {
        res.status(502).json({ error: "ZKE RAG query failed", detail: errText });
      }
      return;
    }

    const data = await response.json() as ZkeRetrieveResponse;

    // Handle no_results gracefully — do not retry (guide Section 6.5)
    if (data.no_results) {
      logger.warn(
        { subject: body.subject, chapter: body.chapter, query: body.query },
        "ZKE returned no_results — topic not in knowledge base or query phrasing too distant"
      );
      res.json({ context: "", source: "zke_no_results", noResults: true });
      return;
    }

    const chunks = data.chunks ?? [];
    if (chunks.length === 0) {
      logger.warn({ body }, "ZKE returned zero chunks");
      res.json({ context: "", source: "zke_empty", noResults: false });
      return;
    }

    // Concatenate chunks in relevance order, separated by double newline.
    // Include document name so the LLM can see provenance.
    const context = chunks
      .map((c) => `[Source: ${c.document_name}]\n${c.content}`)
      .join("\n\n");

    logger.info(
      {
        subject: body.subject,
        chapter: body.chapter,
        top_k,
        chunksReturned: chunks.length,
        chars: context.length,
        embeddingCostUsd: data.embedding_cost_usd,
      },
      "ZKE context retrieved"
    );

    res.json({ context, source: "zke", noResults: false });
  } catch (err) {
    logger.error({ err }, "ZKE request error");
    res.status(502).json({ error: "Failed to reach ZKE RAG service" });
  }
});

export default ragRouter;
