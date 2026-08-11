import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { getAPIServerEngine } from '@/services/apiServerEngine';
import type { DetectedLanguage } from '@/services/aiTypes';

// ─────────────────────────────────────────────────────────────────
// useTTS — on-demand text-to-speech via Sarvam Bulbul v3
//
// Text is chunked server-side (≤490 chars each). The server returns
// an array of base64 WAV strings played sequentially here.
// ─────────────────────────────────────────────────────────────────

export function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const stopFlagRef = useRef(false);
  const tmpPathsRef = useRef<string[]>([]);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false }).catch(() => {});
  }, []);

  // ── Cleanup helpers ──────────────────────────────────────────────

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  }, []);

  const deleteTmpFiles = useCallback(() => {
    for (const p of tmpPathsRef.current) {
      FileSystem.deleteAsync(p, { idempotent: true }).catch(() => {});
    }
    tmpPathsRef.current = [];
  }, []);

  // ── Play one base64 WAV chunk ────────────────────────────────────

  const playChunk = useCallback(async (base64Wav: string): Promise<void> => {
    const tmpPath = `${FileSystem.cacheDirectory}tulc_tts_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`;
    tmpPathsRef.current.push(tmpPath);

    await FileSystem.writeAsStringAsync(tmpPath, base64Wav, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await unloadSound();

    // Re-assert playback mode — recording leaves allowsRecordingIOS: true
    // which resets playsInSilentModeIOS to false on iOS.
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

    const { sound } = await Audio.Sound.createAsync(
      { uri: tmpPath },
      { shouldPlay: true },
    );
    soundRef.current = sound;

    await new Promise<void>((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish || status.error) resolve();
      });
    });
  }, [unloadSound]);

  // ── Core: fetch audios array and play each chunk ─────────────────

  const playSarvam = useCallback(async (id: string, text: string, lang: DetectedLanguage) => {
    stopFlagRef.current = false;
    setSpeakingId(id);

    try {
      const audios = await getAPIServerEngine().synthesizeSpeech(text, lang);

      for (const chunk of audios) {
        if (stopFlagRef.current) break;
        if (chunk) await playChunk(chunk);
      }
    } catch (err) {
      console.error('[TTS] playSarvam error:', err);
    } finally {
      await unloadSound();
      deleteTmpFiles();
      if (!stopFlagRef.current) setSpeakingId(null);
    }
  }, [playChunk, unloadSound, deleteTmpFiles]);

  // ── Public API ───────────────────────────────────────────────────

  const speak = useCallback(
    (id: string, text: string, lang: DetectedLanguage = 'en') => {
      if (!text.trim()) return;

      stopFlagRef.current = true;
      unloadSound();
      deleteTmpFiles();
      setSpeakingId(null);

      setTimeout(() => playSarvam(id, text.trim(), lang), 80);
    },
    [playSarvam, unloadSound, deleteTmpFiles],
  );

  const stop = useCallback(() => {
    stopFlagRef.current = true;
    unloadSound();
    deleteTmpFiles();
    setSpeakingId(null);
  }, [unloadSound, deleteTmpFiles]);

  return { speak, stop, speakingId };
}
