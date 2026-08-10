import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { CoachingMode } from '@/services/aiTypes';
import {
  generateId,
  saveSession,
  saveWeakConcept,
  type SessionRecord,
  type WeakConcept,
} from '@/services/sessionStorage';

// ─────────────────────────────────────────────────────────────────
// Session Context — active learning session state
// ─────────────────────────────────────────────────────────────────

export interface SessionState {
  sessionId: string;
  subjectId: string;
  chapterId: string;
  subjectTitle: string;
  chapterTitle: string;
  currentMode: CoachingMode;
  currentTopic: string;
  conceptsCovered: string[];
  questionsAttempted: number;
  correctAnswers: number;
  weakConcepts: WeakConcept[];
  startedAt: number;
}

interface SessionContextValue {
  session: SessionState | null;
  startSession: (
    subjectId: string,
    chapterId: string,
    subjectTitle: string,
    chapterTitle: string,
    firstTopic: string,
  ) => void;
  updateMode: (mode: CoachingMode) => void;
  updateTopic: (topic: string) => void;
  recordQuestion: (correct: boolean) => void;
  addWeakConcept: (topic: string) => void;
  addConceptCovered: (topic: string) => void;
  endSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  startSession: () => {},
  updateMode: () => {},
  updateTopic: () => {},
  recordQuestion: () => {},
  addWeakConcept: () => {},
  addConceptCovered: () => {},
  endSession: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const sessionRef = useRef<SessionState | null>(null);

  const startSession = useCallback(
    (
      subjectId: string,
      chapterId: string,
      subjectTitle: string,
      chapterTitle: string,
      firstTopic: string,
    ) => {
      const newSession: SessionState = {
        sessionId: generateId(),
        subjectId,
        chapterId,
        subjectTitle,
        chapterTitle,
        currentMode: 'explain',
        currentTopic: firstTopic,
        conceptsCovered: [],
        questionsAttempted: 0,
        correctAnswers: 0,
        weakConcepts: [],
        startedAt: Date.now(),
      };
      sessionRef.current = newSession;
      setSession(newSession);
    },
    [],
  );

  const updateMode = useCallback((mode: CoachingMode) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, currentMode: mode };
      sessionRef.current = next;
      return next;
    });
  }, []);

  const updateTopic = useCallback((topic: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, currentTopic: topic };
      sessionRef.current = next;
      return next;
    });
  }, []);

  const recordQuestion = useCallback((correct: boolean) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        questionsAttempted: prev.questionsAttempted + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      };
      sessionRef.current = next;
      return next;
    });
  }, []);

  const addWeakConcept = useCallback((topic: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const exists = prev.weakConcepts.find((w) => w.topic === topic);
      if (exists) return prev;
      const wc: WeakConcept = {
        topic,
        subject: prev.subjectTitle,
        chapter: prev.chapterTitle,
        chapterId: prev.chapterId,
        encounteredAt: Date.now(),
      };
      saveWeakConcept(wc); // fire-and-forget
      const next = { ...prev, weakConcepts: [...prev.weakConcepts, wc] };
      sessionRef.current = next;
      return next;
    });
  }, []);

  const addConceptCovered = useCallback((topic: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.conceptsCovered.includes(topic)) return prev;
      const next = { ...prev, conceptsCovered: [...prev.conceptsCovered, topic] };
      sessionRef.current = next;
      return next;
    });
  }, []);

  const endSession = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    const record: SessionRecord = {
      id: s.sessionId,
      subjectId: s.subjectId,
      chapterId: s.chapterId,
      subjectTitle: s.subjectTitle,
      chapterTitle: s.chapterTitle,
      startedAt: s.startedAt,
      endedAt: Date.now(),
      conceptsCovered: s.conceptsCovered,
      questionsAttempted: s.questionsAttempted,
      correctAnswers: s.correctAnswers,
      weakConcepts: s.weakConcepts,
    };
    await saveSession(record);
    sessionRef.current = null;
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        startSession,
        updateMode,
        updateTopic,
        recordQuestion,
        addWeakConcept,
        addConceptCovered,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
