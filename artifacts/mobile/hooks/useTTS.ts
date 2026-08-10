import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { DetectedLanguage } from '@/services/aiTypes';

// ─────────────────────────────────────────────────────────────────
// useTTS — on-demand text-to-speech with active-message tracking
//
// English  → expo-speech (native system voice, works offline)
// Marathi  → Google Translate TTS streamed via expo-av
//            No need to install any system Marathi voice.
// ─────────────────────────────────────────────────────────────────

const GTTS_MAX_CHARS = 195; // Google Translate TTS URL limit

/** Split text into chunks that fit the Google TTS URL length. */
function chunkText(text: string, maxLen = GTTS_MAX_CHARS): string[] {
  const parts = text.split(/(?<=[.?!।\n])\s*/);
  const chunks: string[] = [];
  let current = '';
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.length > maxLen) {
      if (current) { chunks.push(current); current = ''; }
      let s = trimmed;
      while (s.length > maxLen) { chunks.push(s.slice(0, maxLen)); s = s.slice(maxLen); }
      current = s;
    } else if (current && (current + ' ' + trimmed).length > maxLen) {
      chunks.push(current);
      current = trimmed;
    } else {
      current = current ? current + ' ' + trimmed : trimmed;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function gttsUrl(text: string, lang: string): string {
  return (
    'https://translate.google.com/translate_tts' +
    `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx&ttsspeed=0.9`
  );
}

export function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const enVoiceRef = useRef<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const stopFlagRef = useRef(false);

  // Discover the best English (preferably en-IN) system voice once.
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
      })
      .catch(() => {});

    // Allow audio to play even when the device is on silent.
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  // ── Marathi: play through Google Translate TTS ──────────────────
  const speakMarathi = useCallback(async (id: string, text: string) => {
    const chunks = chunkText(text);
    if (!chunks.length) return;

    stopFlagRef.current = false;
    setSpeakingId(id);

    for (const chunk of chunks) {
      if (stopFlagRef.current) break;

      try {
        // Unload the previous segment before loading the next.
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: gttsUrl(chunk, 'mr') },
          { shouldPlay: true },
        );
        soundRef.current = sound;

        // Wait for this chunk to finish before moving to the next.
        await new Promise<void>((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) { resolve(); return; }
            if (status.didJustFinish || status.error) { resolve(); }
          });
        });
      } catch {
        break;
      }
    }

    // Clean up and mark done (unless stop() already did).
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    if (!stopFlagRef.current) setSpeakingId(null);
  }, []);

  // ── Public API ───────────────────────────────────────────────────

  /**
   * Speak a message identified by `id`.
   * Calling speak() while another message is playing stops it first.
   */
  const speak = useCallback(
    (id: string, text: string, lang: DetectedLanguage = 'en') => {
      if (!text.trim()) return;

      // Stop whatever is currently playing.
      stopFlagRef.current = true;
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setSpeakingId(null);

      if (lang === 'mr') {
        speakMarathi(id, text.trim());
        return;
      }

      // English via expo-speech.
      setSpeakingId(id);
      const done = () => setSpeakingId(null);
      const voiceId = enVoiceRef.current;
      const opts = { rate: 0.95, pitch: 1.0, onDone: done, onStopped: done, onError: done };
      if (voiceId) {
        Speech.speak(text.trim(), { voice: voiceId, ...opts });
      } else {
        Speech.speak(text.trim(), { language: 'en-IN', ...opts });
      }
    },
    [speakMarathi],
  );

  /** Stop any currently playing speech and clear the active message. */
  const stop = useCallback(() => {
    stopFlagRef.current = true;
    Speech.stop();
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setSpeakingId(null);
  }, []);

  return { speak, stop, speakingId };
}
