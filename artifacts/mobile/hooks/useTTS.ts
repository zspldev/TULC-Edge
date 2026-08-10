import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DetectedLanguage } from '@/services/aiTypes';

const STORAGE_KEY = 'tts_enabled';

// ─────────────────────────────────────────────────────────────────
// useTTS — text-to-speech toggle + speak/stop helpers
// ─────────────────────────────────────────────────────────────────

export function useTTS() {
  const [enabled, setEnabled] = useState(false);

  // Resolved voice identifiers; null means "not available on this device"
  const enVoiceRef = useRef<string | null | 'locale'>('locale'); // 'locale' = use language fallback
  const mrVoiceRef = useRef<string | null>(null);

  // Load saved preference and resolve available voices on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      setEnabled(val === 'true');
    });

    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        // Find best Marathi voice (language starts with 'mr' or identifier contains 'mr-IN')
        const mr = voices.find(
          (v) =>
            v.language?.startsWith('mr') ||
            v.identifier?.toLowerCase().includes('mr-in') ||
            v.identifier?.toLowerCase().includes('mr_in'),
        );
        mrVoiceRef.current = mr?.identifier ?? null;

        // Find best English (Indian) voice — prefer en-IN, fall back to any en
        const enIN = voices.find(
          (v) =>
            v.language === 'en-IN' ||
            v.identifier?.toLowerCase().includes('en-in') ||
            v.identifier?.toLowerCase().includes('en_in'),
        );
        const enAny = voices.find((v) => v.language?.startsWith('en'));
        enVoiceRef.current = enIN?.identifier ?? enAny?.identifier ?? 'locale';
      })
      .catch(() => {
        // getAvailableVoicesAsync may fail on some Android versions — use locale fallback
        enVoiceRef.current = 'locale';
        mrVoiceRef.current = null;
      });
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
    if (!next) Speech.stop();
  }, [enabled]);

  /**
   * Speak text in the detected language.
   * - If the required voice isn't installed on the device, stays silent
   *   rather than playing garbled output through a wrong voice.
   * - Stops any in-progress speech before starting.
   */
  const speak = useCallback(
    (text: string, lang: DetectedLanguage = 'en') => {
      if (!enabled || !text.trim()) return;

      if (lang === 'mr') {
        // Only speak Marathi if a real Marathi voice is available
        if (!mrVoiceRef.current) return;
        Speech.stop();
        Speech.speak(text.trim(), {
          voice: mrVoiceRef.current,
          rate: 0.85, // slightly slower — Marathi syllables benefit from more time
          pitch: 1.0,
        });
      } else {
        Speech.stop();
        const voiceId = enVoiceRef.current;
        if (voiceId && voiceId !== 'locale') {
          Speech.speak(text.trim(), { voice: voiceId, rate: 0.95, pitch: 1.0 });
        } else {
          // Locale-based fallback for English (always available)
          Speech.speak(text.trim(), { language: 'en-IN', rate: 0.95, pitch: 1.0 });
        }
      }
    },
    [enabled],
  );

  /** Stop any currently playing speech. */
  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { ttsEnabled: enabled, toggleTTS: toggle, speak, stop };
}
