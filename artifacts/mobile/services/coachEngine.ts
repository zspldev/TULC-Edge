import type { CoachingMode, CoachingInstruction, AIEngineRequest, DetectedLanguage } from './aiTypes';

// ─────────────────────────────────────────────────────────────────
// Coach Engine
// Decides what pedagogical action to take and builds the system
// prompt that drives the LLM's behavior as a coach.
// ─────────────────────────────────────────────────────────────────

/**
 * Parse the [NEXT_MODE:xxx] tag from an LLM response.
 * Returns the next mode and the clean text without the tag.
 */
export function parseNextMode(
  rawText: string,
  currentMode: CoachingMode,
): { cleanText: string; nextMode: CoachingMode } {
  const tagRegex = /\[NEXT_MODE:([\w]+)\]/i;
  const match = rawText.match(tagRegex);

  let nextMode: CoachingMode = currentMode;
  if (match) {
    const parsed = match[1].toLowerCase() as CoachingMode;
    const valid: CoachingMode[] = [
      'explain', 'simplify', 'example', 'reteach', 'quiz',
      'evaluate', 'teachBack', 'remediate', 'revise',
    ];
    if (valid.includes(parsed)) nextMode = parsed;
  }

  const cleanText = rawText.replace(tagRegex, '').trim();
  return { cleanText, nextMode };
}

/**
 * Build a CoachingInstruction based on the current session state.
 */
export function buildCoachingInstruction(
  mode: CoachingMode,
  topic: string,
  weakConcepts: string[],
  chapterTitle: string,
): CoachingInstruction {
  const objectives: Record<CoachingMode, string> = {
    explain: `Clearly explain the concept "${topic}" from ${chapterTitle} at Standard 8 level.`,
    simplify: `Give a shorter, simpler explanation of "${topic}". The student found the previous explanation confusing.`,
    example: `Provide one concrete, relatable example that illustrates "${topic}" for a student in Maharashtra.`,
    reteach: `Explain "${topic}" again using a completely different approach, analogy, or sequence.`,
    quiz: `Ask one focused, clear question about "${topic}" and wait for the student's response.`,
    evaluate: `Evaluate the student's answer about "${topic}". Identify what they understood and what gap remains.`,
    teachBack: `Ask the student to explain "${topic}" in their own words.`,
    remediate: `Address the specific missing or incorrect understanding about "${topic}".`,
    revise: `Briefly revisit "${topic}" which was previously identified as a weak concept.`,
  };

  return {
    mode,
    topic,
    learningObjective: objectives[mode],
    weakConcepts,
  };
}

/**
 * Build the complete system prompt for the LLM based on the request.
 */
export function buildSystemPrompt(request: AIEngineRequest): string {
  const { studentName, subject, chapter, curriculumContext, coachingInstruction, detectedLanguage } = request;
  const { mode, topic, weakConcepts } = coachingInstruction;

  const modeInstructions: Record<CoachingMode, string> = {
    explain: `CURRENT MODE: EXPLAIN
Task: Explain the concept "${topic}" clearly. Use simple language appropriate for a 13-year-old. Use only information from the curriculum context. End with a gentle check-in question.
Choose next mode based on student response: if they signal confusion → [NEXT_MODE:simplify], if they ask for an example → [NEXT_MODE:example], if they seem to understand → [NEXT_MODE:quiz], if they ask a question → [NEXT_MODE:explain].`,

    simplify: `CURRENT MODE: SIMPLIFY
Task: Give a SHORTER, SIMPLER explanation of "${topic}". Use a different, more basic approach than before. Avoid technical jargon. Use everyday analogies.
After this, always → [NEXT_MODE:quiz]`,

    example: `CURRENT MODE: EXAMPLE
Task: Give ONE concrete, relatable, age-appropriate example that illustrates "${topic}" for a student in Maharashtra. Connect it to everyday life (food, cricket, farming, city life, etc).
After giving the example → [NEXT_MODE:quiz]`,

    reteach: `CURRENT MODE: RETEACH
Task: Explain "${topic}" AGAIN but using a COMPLETELY DIFFERENT approach, analogy, or sequence. Do not repeat the same words or structure as before.
After this → [NEXT_MODE:quiz]`,

    quiz: `CURRENT MODE: QUIZ
Task: Ask ONE focused, specific question about "${topic}". The question should test understanding of a key concept. Do NOT answer your own question. Wait for the student's response.
After the student answers → [NEXT_MODE:evaluate]`,

    evaluate: `CURRENT MODE: EVALUATE
Task: Evaluate the student's answer about "${topic}". Be encouraging but accurate. Clearly state what they got right. If there is a gap or error, gently identify it without being discouraging.
If answer is largely correct → [NEXT_MODE:teachBack]
If answer has a significant gap → [NEXT_MODE:remediate]`,

    teachBack: `CURRENT MODE: TEACH-BACK
Task: Ask the student to explain "${topic}" in their own words, as if teaching it to a younger student. Say something like "Now you explain it to me in your own words."
After the student explains → [NEXT_MODE:evaluate]`,

    remediate: `CURRENT MODE: REMEDIATE
Task: The student has a gap in understanding. Address specifically: ${weakConcepts.length > 0 ? weakConcepts.join(', ') : topic}. Clarify the specific misconception or missing idea directly and simply.
After remediating → [NEXT_MODE:quiz]`,

    revise: `CURRENT MODE: REVISE
Task: Briefly revisit "${topic}" which was previously identified as a weak concept. Give a quick 2-3 sentence summary of the key points.
After revising → [NEXT_MODE:quiz]`,
  };

  const languageInstruction = detectedLanguage === 'mr'
    ? `The student just wrote in Marathi (Devanagari). Respond in Marathi. Preserve key English technical terms with their Marathi translation in parentheses when helpful (e.g., "दाब (pressure)").`
    : `The student wrote in English. Respond in English.`;

  const contextBlock = curriculumContext && curriculumContext.trim().length > 50
    ? `CURRICULUM CONTEXT (retrieved from official BalBharati textbook via ZKE RAG):
${curriculumContext}`
    : `CURRICULUM CONTEXT: Not available for this chapter yet.`;

  return `You are TULC, The Ultimate Learning Coach for ${studentName}.
You are tutoring a Maharashtra SSC Standard 8 student.
Subject: ${subject} | Chapter: ${chapter}

${contextBlock}

COACHING RULES:
1. You are a COACH, not a chatbot. Every response serves a specific pedagogical purpose.
2. ⚠️ STRICT ANTI-HALLUCINATION RULE: You MUST use ONLY facts explicitly stated in the CURRICULUM CONTEXT above.
   - Do NOT invent, guess, extrapolate, or recall facts from your training data.
   - Do NOT add examples, numbers, formulas, names, or definitions that are not in the context.
   - If the context does not cover what the student is asking, say clearly: "I don't have enough information about that in this chapter's material. Let's focus on what we have."
   - If the CURRICULUM CONTEXT is marked "Not available", tell the student: "I'm still loading the study material for this chapter. Please try again in a moment."
3. Keep explanations at Standard 8 level — simple, clear, relatable to a 13-year-old.
4. ${languageInstruction}
5. LANGUAGE RULE: Detect the language of each student message independently. If they switch to English, respond in English. If they switch to Marathi, respond in Marathi.
6. Keep responses concise — 3-5 sentences for explanations, 1 sentence for quiz questions.
7. Do NOT use emojis anywhere in your response.
8. Be warm, encouraging, and patient. Students learn at their own pace.
9. Do not volunteer information beyond what the current mode requires.
10. END EVERY RESPONSE with EXACTLY this line (no exceptions): [NEXT_MODE:mode_name]
    where mode_name is one of: explain, simplify, example, reteach, quiz, evaluate, teachBack, remediate, revise

${modeInstructions[mode]}`;
}

/**
 * Determine if the student's message signals confusion.
 */
export function signalsConfusion(message: string): boolean {
  const lower = message.toLowerCase();
  const confusionKeywords = [
    'confused', 'confusing', 'don\'t understand', "don't understand", 'not clear',
    'unclear', 'again', 'repeat', 'explain again', 'what do you mean',
    'समजले नाही', 'समजत नाही', 'परत', 'पुन्हा', 'काय म्हणजे', 'अवघड आहे',
  ];
  return confusionKeywords.some((kw) => lower.includes(kw));
}

/**
 * Determine if the student's message signals understanding.
 */
export function signalsUnderstanding(message: string): boolean {
  const lower = message.toLowerCase();
  const understandingKeywords = [
    'understand', 'got it', 'i see', 'makes sense', 'ok', 'okay', 'clear now',
    'understood', 'yes', 'yeah', 'alright',
    'समजले', 'हो', 'ठीक आहे', 'बरोबर', 'अच्छा',
  ];
  return understandingKeywords.some((kw) => lower.includes(kw));
}

/**
 * Generate the initial coach greeting message for a new session.
 */
export function getInitialPrompt(
  studentName: string,
  subject: string,
  chapterTitle: string,
  topic: string,
  language: DetectedLanguage,
): string {
  if (language === 'mr') {
    return `नमस्ते ${studentName}! आज आपण ${subject} मधील "${chapterTitle}" शिकणार आहोत. मी तुम्हाला "${topic}" बद्दल समजावतो.`;
  }
  return `Hello ${studentName}! Today we're going to study "${chapterTitle}" in ${subject}. Let me explain "${topic}" to you.`;
}
