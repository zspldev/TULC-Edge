// ─────────────────────────────────────────────────────────────────
// TULC AIEngine Contract
// The cloud LLM adapter (OpenRouter) implements this interface.
// The future on-device SLM adapter will implement the same interface.
// ─────────────────────────────────────────────────────────────────

export type CoachingMode =
  | 'explain'
  | 'simplify'
  | 'example'
  | 'reteach'
  | 'quiz'
  | 'evaluate'
  | 'teachBack'
  | 'remediate'
  | 'revise';

export type DetectedLanguage = 'en' | 'mr';

export interface CoachingInstruction {
  mode: CoachingMode;
  topic: string;
  learningObjective: string;
  weakConcepts: string[];
  responseConstraints?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIEngineRequest {
  studentQuestion: string;
  detectedLanguage: DetectedLanguage;
  curriculumContext: string;
  coachingInstruction: CoachingInstruction;
  conversationHistory: ChatMessage[];
  studentName: string;
  subject: string;
  chapter: string;
}

export interface AIEngineResponse {
  generatedText: string;
  responseLanguage: DetectedLanguage;
  nextMode: CoachingMode;
  latencyMs: number;
}

export interface AIEngine {
  generate(
    request: AIEngineRequest,
    onChunk?: (text: string) => void,
  ): Promise<AIEngineResponse>;
  isAvailable(): boolean;
}

export const COACHING_MODE_LABELS: Record<CoachingMode, string> = {
  explain: 'Explaining',
  simplify: 'Simplifying',
  example: 'Example',
  reteach: 'Reteaching',
  quiz: 'Quiz',
  evaluate: 'Evaluating',
  teachBack: 'Teach-Back',
  remediate: 'Remediating',
  revise: 'Revising',
};

export const COACHING_MODE_LABELS_MR: Record<CoachingMode, string> = {
  explain: 'समजावत आहे',
  simplify: 'सोपे करत आहे',
  example: 'उदाहरण',
  reteach: 'पुन्हा शिकवत आहे',
  quiz: 'प्रश्नोत्तर',
  evaluate: 'मूल्यमापन',
  teachBack: 'स्वतः सांगा',
  remediate: 'दुरुस्ती',
  revise: 'उजळणी',
};
