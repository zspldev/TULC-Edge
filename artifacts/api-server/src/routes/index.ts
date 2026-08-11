import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coachRouter from "./coach";
import ragRouter from "./rag";
import transcribeRouter from "./transcribe";
import ttsRouter from "./tts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coachRouter);
router.use(ragRouter);
router.use(transcribeRouter);
router.use(ttsRouter);

export default router;
