import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { getAPIServerEngine } from '@/services/apiServerEngine';
import type { DetectedLanguage } from '@/services/aiTypes';

// ─────────────────────────────────────────────────────────────────
// useTTS — on-demand text-to-speech via Sarvam Bulbul v3
//
// Both English and Marathi are synthesised server-side using
// Sarvam Bulbul v3, which natively supports Indian English and
// Marathi. Audio is returned as base64 WAV, written to a temp file,
// and played with expo-av.
//
// No system voice installation required.
// ─────────────────────────────────────────────────────────────────

export function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const stopFlagRef = useRef(false);

  useEffect(() => {
    // Allow audio to play even when the device is on silent.
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  // ── Core playback ────────────────────────────────────────────────

  const playSarvam = useCallback(async (id: string, text: string, lang: DetectedLanguage) => {
    stopFlagRef.current = false;
    setSpeakingId(id);

    let tmpPath: string | null = null;
    try {
      // 1. Fetch base64 WAV from the API server (Sarvam Bulbul v3).
      const base64Audio = await getAPIServerEngine().synthesizeSpeech(text, lang);
      if (!base64Audio || stopFlagRef.current) return;

      // 2. Write to a temp file so expo-av can play it.
      tmpPath = `${FileSystem.cacheDirectory}tulc_tts_${Date.now()}.wav`;
      await FileSystem.writeAsStringAsync(tmpPath, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (stopFlagRef.current) return;

      // 3. Re-assert playback audio mode — recording resets playsInSilentModeIOS
      //    to false, which silences TTS on iOS if the phone is not on silent.
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // 4. Unload any previous sound and load the new one.
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: tmpPath },
        { shouldPlay: true },
      );
      soundRef.current = sound;

      // 4. Wait until playback finishes naturally.
      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) { resolve(); return; }
          if (status.didJustFinish || status.error) { resolve(); }
        });
      });
    } catch (err) {
      // Swallow — if synthesis fails the button simply resets.
    } finally {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      // Delete the temp file to keep the cache tidy.
      if (tmpPath) {
        FileSystem.deleteAsync(tmpPath, { idempotent: true }).catch(() => {});
      }
      if (!stopFlagRef.current) setSpeakingId(null);
    }
  }, []);

  // ── Public API ───────────────────────────────────────────────────

  /**
   * Speak a message identified by `id`.
   * If something is already playing it is stopped first.
   */
  const speak = useCallback(
    (id: string, text: string, lang: DetectedLanguage = 'en') => {
      if (!text.trim()) return;

      // Stop current playback immediately.
      stopFlagRef.current = true;
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setSpeakingId(null);

      // Small tick so the stop state settles before the new request fires.
      setTimeout(() => playSarvam(id, text.trim(), lang), 50);
    },
    [playSarvam],
  );

  /** Stop any currently playing speech and clear the active message. */
  const stop = useCallback(() => {
    stopFlagRef.current = true;
    if (soundRef.current) {
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setSpeakingId(null);
  }, []);

  return { speak, stop, speakingId };
}
