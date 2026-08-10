import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CoachingMode } from './aiTypes';

// ─────────────────────────────────────────────────────────────────
// Session Storage — AsyncStorage persistence for TULC
// ─────────────────────────────────────────────────────────────────

export interface StudentProfile {
  name: string;
  createdAt: number;
}

export interface WeakConcept {
  topic: string;
  subject: string;
  chapter: string;
  chapterId: string;
  encounteredAt: number;
  resolvedAt?: number;
}

export interface SessionRecord {
  id: string;
  subjectId: string;
  chapterId: string;
  subjectTitle: string;
  chapterTitle: string;
  startedAt: number;
  endedAt?: number;
  conceptsCovered: string[];
  questionsAttempted: number;
  correctAnswers: number;
  weakConcepts: WeakConcept[];
}

export interface ChapterProgress {
  subjectId: string;
  chapterId: string;
  lastMode: CoachingMode;
  lastTopic: string;
  sessions: number;
  weakConcepts: string[];
  lastAccessedAt: number;
}

const KEYS = {
  PROFILE: 'tulc_profile',
  SESSIONS: 'tulc_sessions',
  WEAK_CONCEPTS: 'tulc_weak_concepts',
  CHAPTER_PROGRESS: (subjectId: string, chapterId: string) =>
    `tulc_progress_${subjectId}_${chapterId}`,
};

// ── Profile ──────────────────────────────────────────────────────

export async function saveProfile(profile: StudentProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function loadProfile(): Promise<StudentProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.PROFILE);
  return raw ? JSON.parse(raw) : null;
}

// ── Sessions ─────────────────────────────────────────────────────

export async function saveSession(session: SessionRecord): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  const sessions: SessionRecord[] = raw ? JSON.parse(raw) : [];
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session); // newest first
  }
  // Keep last 50 sessions
  const trimmed = sessions.slice(0, 50);
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(trimmed));
}

export async function loadSessions(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  return raw ? JSON.parse(raw) : [];
}

// ── Weak Concepts ─────────────────────────────────────────────────

export async function saveWeakConcept(concept: WeakConcept): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.WEAK_CONCEPTS);
  const concepts: WeakConcept[] = raw ? JSON.parse(raw) : [];
  const exists = concepts.findIndex(
    (c) => c.topic === concept.topic && c.chapterId === concept.chapterId,
  );
  if (exists >= 0) {
    concepts[exists] = concept;
  } else {
    concepts.unshift(concept);
  }
  await AsyncStorage.setItem(KEYS.WEAK_CONCEPTS, JSON.stringify(concepts));
}

export async function loadWeakConcepts(): Promise<WeakConcept[]> {
  const raw = await AsyncStorage.getItem(KEYS.WEAK_CONCEPTS);
  return raw ? JSON.parse(raw) : [];
}

export async function resolveWeakConcept(topic: string, chapterId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.WEAK_CONCEPTS);
  const concepts: WeakConcept[] = raw ? JSON.parse(raw) : [];
  const idx = concepts.findIndex((c) => c.topic === topic && c.chapterId === concept.chapterId);
  if (idx >= 0) {
    concepts[idx] = { ...concepts[idx], resolvedAt: Date.now() };
    await AsyncStorage.setItem(KEYS.WEAK_CONCEPTS, JSON.stringify(concepts));
  }
}

// ── Chapter Progress ──────────────────────────────────────────────

export async function saveChapterProgress(progress: ChapterProgress): Promise<void> {
  const key = KEYS.CHAPTER_PROGRESS(progress.subjectId, progress.chapterId);
  await AsyncStorage.setItem(key, JSON.stringify(progress));
}

export async function loadChapterProgress(
  subjectId: string,
  chapterId: string,
): Promise<ChapterProgress | null> {
  const key = KEYS.CHAPTER_PROGRESS(subjectId, chapterId);
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

// ── Utility ───────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
