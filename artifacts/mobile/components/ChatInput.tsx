import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  requestMicrophonePermission,
  startRecording,
  stopRecording,
} from '@/services/voiceService';

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceTranscript?: (audioUri: string) => void;
  disabled?: boolean;
  isTranscribing?: boolean;
}

export default function ChatInput({
  onSend,
  onVoiceTranscript,
  disabled = false,
  isTranscribing = false,
}: ChatInputProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleVoicePress = async () => {
    if (disabled) return;
    if (Platform.OS === 'web') return; // No web voice support

    if (isRecording) {
      // Stop recording
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(false);
      const uri = await stopRecording();
      if (uri && onVoiceTranscript) {
        onVoiceTranscript(uri);
      }
    } else {
      // Start recording
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) return;
      const started = await startRecording();
      if (started) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsRecording(true);
      }
    }
  };

  const canSend = text.trim().length > 0 && !disabled;
  const styles = makeStyles(colors, insets.bottom);

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingBanner}>
          <View style={[styles.recordingDot, { backgroundColor: colors.destructive }]} />
          <Text style={[styles.recordingText, { color: colors.destructive }]}>
            Recording... Tap mic to stop
          </Text>
        </View>
      )}
      {isTranscribing && (
        <View style={styles.recordingBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.recordingText, { color: colors.mutedForeground }]}>
            Transcribing voice...
          </Text>
        </View>
      )}
      <View style={styles.inputRow}>
        {Platform.OS !== 'web' && (
          <Pressable
            onPress={handleVoicePress}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: isRecording
                  ? `${colors.destructive}18`
                  : colors.secondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            disabled={disabled && !isRecording}
          >
            <Ionicons
              name={isRecording ? 'stop-circle' : 'mic-outline'}
              size={20}
              color={isRecording ? colors.destructive : colors.primary}
            />
          </Pressable>
        )}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.foreground,
              backgroundColor: colors.card,
              borderColor: colors.border,
              fontFamily: 'Inter_400Regular',
            },
          ]}
          placeholder="Ask a question..."
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          multiline
          maxLength={500}
          editable={!disabled}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: canSend ? colors.primary : colors.secondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={canSend ? colors.primaryForeground : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>, bottomInset: number) =>
  StyleSheet.create({
    container: {
      paddingBottom: Math.max(bottomInset, 8),
      paddingHorizontal: 12,
      paddingTop: 8,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    recordingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 4,
      paddingBottom: 6,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    recordingText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 13,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      fontSize: 15,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
  });
