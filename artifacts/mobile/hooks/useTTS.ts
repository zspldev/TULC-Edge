import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import type { DetectedLanguage } from '@/services/aiTypes';

// ─────────────────────────────────────────────────────────────────
// useTTS — on-demand text-to-speech with active-message tracking
// ─────────────────────────────────────────────────────────────────

export function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [mrVoiceAvailable, setMrVoiceAvailable] = useState<boolean>(false);

  const enVoiceRef = useRef<string | null>(null);
  const mrVoiceRef = useRef<string | null>(null);

  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const enIN = voices.find(
          (v) =>
            v.language === 'en-IN' ||
            v.identifier?.toLowerCase().includes('en-in') ||
            v.identifier?.toLowerCase().includes('en_in'),
        );
        enVoiceRef.current =
          enIN?.identifier ??
          voices.find((v) => v.language?.startsWith('en'))?.identifier ??
          null;

        const mr = voices.find(
          (v) =>
            v.language?.startsWith('mr') ||
            v.identifier?.toLowerCase().includes('mr-in') ||
            v.identifier?.toLowerCase().includes('mr_in'),
        );
        mrVoiceRef.current = mr?.identifier ?? null;
        setMrVoiceAvailable(mr != null);
      })
      .catch(() => {});
  }, []);

  /**
   * Speak a message identified by `id`.
   * Calling speak() while another message is playing stops the previous one first.
   * `speakingId` tracks which message is currently being read aloud.
   */
  const speak = useCallback(
    (id: string, text: string, lang: DetectedLanguage = 'en') => {
      if (!text.trim()) return;

      if (lang === 'mr' && !mrVoiceRef.current) return; // no Marathi voice installed

      Speech.stop();
      setSpeakingId(id);

      const done = () => setSpeakingId(null);

      if (lang === 'mr') {
        Speech.speak(text.trim(), {
          voice: mrVoiceRef.current!,
          rate: 0.85,
          pitch: 1.0,
          onDone: done,
          onStopped: done,
          onError: done,
        });
      } else {
        const voiceId = enVoiceRef.current;
        const opts = { rate: 0.95, pitch: 1.0, onDone: done, onStopped: done, onError: done };
        if (voiceId) {
          Speech.speak(text.trim(), { voice: voiceId, ...opts });
        } else {
          Speech.speak(text.trim(), { language: 'en-IN', ...opts });
        }
      }
    },
    [],
  );

  /** Stop any currently playing speech and clear the active message. */
  const stop = useCallback(() => {
    Speech.stop();
    setSpeakingId(null);
  }, []);

  return { speak, stop, speakingId, mrVoiceAvailable };
}
