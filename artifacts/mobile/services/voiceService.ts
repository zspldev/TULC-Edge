import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────
// Voice Service — expo-av recording
// Transcription is done by OpenRouterAIEngine.transcribeAudio()
// ─────────────────────────────────────────────────────────────────

let currentRecording: Audio.Recording | null = null;

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

/**
 * Request microphone permission.
 * Returns true if granted.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false; // Web not supported
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Start recording audio.
 * Returns true if recording started successfully.
 */
export async function startRecording(): Promise<boolean> {
  try {
    if (currentRecording) {
      await stopAndDiscard();
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording, status } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    if (!status.isRecording) return false;
    currentRecording = recording;
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    currentRecording = null;
    return false;
  }
}

/**
 * Stop recording and return the audio file URI.
 * Returns null if no recording was in progress.
 */
export async function stopRecording(): Promise<string | null> {
  if (!currentRecording) return null;

  try {
    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI();
    currentRecording = null;

    // Restore full playback mode — omitting playsInSilentModeIOS would
    // reset it to false (iOS default), silencing any subsequent TTS audio.
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    return uri ?? null;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    currentRecording = null;
    return null;
  }
}

/**
 * Discard the current recording without returning a URI.
 */
export async function stopAndDiscard(): Promise<void> {
  if (!currentRecording) return;
  try {
    await currentRecording.stopAndUnloadAsync();
  } catch {}
  currentRecording = null;
}

/**
 * Check if recording is currently in progress.
 */
export function isRecording(): boolean {
  return currentRecording !== null;
}
