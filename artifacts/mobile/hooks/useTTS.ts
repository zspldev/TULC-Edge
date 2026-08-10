import { useCallback, useEffect, useState } from 'react';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DetectedLanguage } from '@/services/aiTypes';

const STORAGE_KEY = 'tts_enabled';

// Map detected language codes to BCP-47 voice locales.
// Both iOS and Android ship Marathi (mr-IN) and Indian English (en-IN) voices.
const LANG_TO_LOCALE: Record<DetectedLanguage, string> = {
  mr: 'mr-IN',
  en:  'en-IN',
};

// ─────────────────────────────────────────────────────────────────
// useTTS — text-to-speech toggle + speak/stop helpers
// ─────────────────────────────────────────────────────────────────

export function useTTS() {
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      setEnabled(val === 'true');
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
    if (!next) {
      // Stop any in-progress speech when user disables TTS
      Speech.stop();
    }
  }, [enabled]);

  /**
   * Speak text in the detected language.
   * Does nothing when TTS is disabled or text is empty.
   * Stops any ongoing speech before starting.
   */
  const speak = useCallback(
    (text: string, lang: DetectedLanguage = 'en') => {
      if (!enabled || !text.trim()) return;
      Speech.stop();
      Speech.speak(text.trim(), {
        language: LANG_TO_LOCALE[lang],
        rate: 0.95,    // slightly slower than default for clarity
        pitch: 1.0,
      });
    },
    [enabled],
  );

  /** Stop any currently playing speech. */
  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { ttsEnabled: enabled, ttsLoaded: loaded, toggleTTS: toggle, speak, stop };
}
