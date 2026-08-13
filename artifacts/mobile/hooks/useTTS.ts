import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { getAPIServerEngine } from '@/services/apiServerEngine';
import type { DetectedLanguage } from '@/services/aiTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Sentence splitter
//
// Splits at .  !  ?  । (Devanagari danda) and merges fragments shorter than
// 30 chars to avoid tiny TTS calls that would create audible gaps.
// ─────────────────────────────────────────────────────────────────────────────
function splitSentences(text: string): string[] {
  const raw = text.split(/(?<=[.!?\u0964])\s+/);
  const merged: string[] = [];
  let acc = '';
  for (const part of raw) {
    acc = acc ? `${acc} ${part}` : part;
    if (acc.trim().length >= 30) {
      merged.push(acc.trim());
      acc = '';
    }
  }
  if (acc.trim()) merged.push(acc.trim());
  return merged.filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// useTTS — sentence-level streaming TTS via Sarvam Bulbul v3
//
// Each assistant message is split into sentences. TTS is fetched per sentence
// (with an in-flight dedup cache keyed by "${messageId}:${sentenceIndex}") so
// playback can start as soon as the first sentence is ready rather than waiting
// for the full response to be synthesised.
//
// Public API (unchanged from previous version — MessageBubble needs no edits):
//   speak(id, text, lang)   — cancel current playback, start sentence-by-sentence
//   stop()                  — cancel immediately
//   speakingId              — the id currently playing, or null
//
// Additional exports for the chat screen:
//   prefetchStreamingSentences(msgId, accumulatedText, lang)
//     Call from onChunk with the text accumulated so far.
//     Kicks off TTS for every sentence that already has text following it.
//
//   prefetchMessageTTS(msgId, fullText, lang)
//     Call once LLM streaming ends (fire-and-forget).
//     Fetches remaining sentences one-by-one; by the time the user taps Speak
//     (or auto-play triggers) each sentence is already cached.
// ─────────────────────────────────────────────────────────────────────────────

export function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const soundRef    = useRef<Audio.Sound | null>(null);
  const tmpPathsRef = useRef<string[]>([]);

  // Sentence-level TTS cache. Keys are "${messageId}:${sentenceIndex}".
  // Values are the base64 WAV string[] that Sarvam returns.
  const sentCache   = useRef(new Map<string, string[]>());
  const sentPending = useRef(new Map<string, Promise<string[]>>());
  const sentFetched = useRef(new Set<string>());    // tracks which messages have had full prefetch started
  const playbackId  = useRef(0);                    // increment to cancel any active playback loop

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false }).catch(() => {});
    return () => {
      // Clear cache on unmount. base64 strings are just memory — no URLs to revoke.
      sentCache.current.clear();
      sentPending.current.clear();
      sentFetched.current.clear();
    };
  }, []);

  // ── Cleanup helpers ────────────────────────────────────────────────────────

  const unloadSound = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    soundRef.current = null; // null immediately so concurrent callers don't get the same ref
    await sound.stopAsync().catch(() => {});
    await sound.unloadAsync().catch(() => {});
  }, []);

  const deleteTmpFiles = useCallback(() => {
    for (const p of tmpPathsRef.current) {
      FileSystem.deleteAsync(p, { idempotent: true }).catch(() => {});
    }
    tmpPathsRef.current = [];
  }, []);

  // ── Play one base64 WAV chunk via expo-av ──────────────────────────────────

  const playChunk = useCallback(async (base64Wav: string): Promise<void> => {
    const tmpPath = `${FileSystem.cacheDirectory}tulc_tts_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`;
    tmpPathsRef.current.push(tmpPath);

    await FileSystem.writeAsStringAsync(tmpPath, base64Wav, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await unloadSound();

    // Re-assert playback mode — recording leaves allowsRecordingIOS:true which
    // resets playsInSilentModeIOS to false on iOS.
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

  // ── Fetch TTS for one sentence (cache + in-flight dedup) ──────────────────

  const fetchSentenceTTS = useCallback(
    (text: string, key: string, lang: DetectedLanguage): Promise<string[]> => {
      const cached = sentCache.current.get(key);
      if (cached) return Promise.resolve(cached);

      const inflight = sentPending.current.get(key);
      if (inflight) return inflight;

      const promise = getAPIServerEngine()
        .synthesizeSpeech(text, lang)
        .then((audios) => {
          sentCache.current.set(key, audios);
          sentPending.current.delete(key);
          return audios;
        })
        .catch((err) => {
          sentPending.current.delete(key);
          throw err;
        });

      sentPending.current.set(key, promise);
      return promise;
    },
    [],
  );

  // ── Pre-fetch sentences that are complete during streaming ────────────────
  // "Complete" = there is at least one more sentence after it in the buffer.
  // Call from onChunk with the stripped accumulated text so far.

  const prefetchStreamingSentences = useCallback(
    (msgId: string, accumulatedText: string, lang: DetectedLanguage) => {
      const sentences = splitSentences(accumulatedText);
      if (sentences.length < 2) return; // last sentence might still be incomplete
      for (let i = 0; i < sentences.length - 1; i++) {
        const key = `${msgId}:${i}`;
        if (!sentCache.current.has(key) && !sentPending.current.has(key)) {
          fetchSentenceTTS(sentences[i], key, lang).catch(() => {});
        }
      }
    },
    [fetchSentenceTTS],
  );

  // ── Pre-fetch all sentences sequentially (call when streaming ends) ───────
  // Sequential (not parallel) to avoid hammering the Sarvam rate limit.
  // By the time sentence 1 finishes playing, sentence 2 is already cached.

  const prefetchMessageTTS = useCallback(
    (msgId: string, text: string, lang: DetectedLanguage) => {
      if (sentFetched.current.has(msgId)) return; // already running
      sentFetched.current.add(msgId);
      const sentences = splitSentences(text);
      if (!sentences.length) return;
      (async () => {
        for (let i = 0; i < sentences.length; i++) {
          const key = `${msgId}:${i}`;
          if (!sentCache.current.has(key) && !sentPending.current.has(key)) {
            await fetchSentenceTTS(sentences[i], key, lang).catch(() => {});
          }
        }
      })();
    },
    [fetchSentenceTTS],
  );

  // ── Play a message sentence-by-sentence ───────────────────────────────────

  const playSentences = useCallback(
    async (id: string, text: string, lang: DetectedLanguage) => {
      playbackId.current += 1;
      const myId = playbackId.current;

      setSpeakingId(id);

      const sentences = splitSentences(text);
      if (!sentences.length) {
        setSpeakingId(null);
        return;
      }

      // Ensure sequential prefetch is running even if caller didn't call prefetchMessageTTS
      if (!sentFetched.current.has(id)) prefetchMessageTTS(id, text, lang);

      try {
        for (let i = 0; i < sentences.length; i++) {
          if (playbackId.current !== myId) break;
          const key = `${id}:${i}`;
          // Wait for this sentence's audio (instant if already cached)
          const audios = await fetchSentenceTTS(sentences[i], key, lang);
          if (playbackId.current !== myId) break;
          for (const chunk of audios) {
            if (playbackId.current !== myId) break;
            if (chunk) await playChunk(chunk);
          }
        }
      } catch (err) {
        console.error('[TTS] playSentences error:', err);
      } finally {
        if (playbackId.current === myId) {
          await unloadSound();
          deleteTmpFiles();
          setSpeakingId(null);
        }
      }
    },
    [fetchSentenceTTS, prefetchMessageTTS, playChunk, unloadSound, deleteTmpFiles],
  );

  // ── Public API ─────────────────────────────────────────────────────────────

  const speak = useCallback(
    (id: string, text: string, lang: DetectedLanguage = 'en') => {
      if (!text.trim()) return;
      // Cancel any active playback loop by incrementing the ID
      playbackId.current += 1;
      unloadSound();
      deleteTmpFiles();
      setSpeakingId(null);
      // Small delay so the UI clears before the new playback starts
      setTimeout(() => playSentences(id, text.trim(), lang), 80);
    },
    [playSentences, unloadSound, deleteTmpFiles],
  );

  const stop = useCallback(() => {
    playbackId.current += 1;
    unloadSound();
    deleteTmpFiles();
    setSpeakingId(null);
  }, [unloadSound, deleteTmpFiles]);

  return { speak, stop, speakingId, prefetchMessageTTS, prefetchStreamingSentences };
}
