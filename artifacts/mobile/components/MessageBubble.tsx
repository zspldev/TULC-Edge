import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { CoachingMode, DetectedLanguage } from '@/services/aiTypes';
import CoachModeTag from './CoachModeTag';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: CoachingMode;
  timestamp: number;
  responseLanguage?: DetectedLanguage;
}

interface MessageBubbleProps {
  message: Message;
  studentName: string;
  /** Called when the user taps Speak. Parent passes message id so useTTS can track which is active. */
  onSpeak?: (id: string, text: string, lang: DetectedLanguage) => void;
  /** True while this specific message is being read aloud. */
  isSpeaking?: boolean;
  /** Stop the current speech. */
  onStop?: () => void;
}

export default function MessageBubble({
  message,
  studentName,
  onSpeak,
  isSpeaking = false,
  onStop,
}: MessageBubbleProps) {
  const colors = useColors();
  const isUser = message.role === 'user';
  const styles = makeStyles(colors, isUser);

  const handleSpeak = () => {
    if (!onSpeak) return;
    onSpeak(message.id, message.content, message.responseLanguage ?? 'en');
  };

  return (
    <View style={styles.wrapper}>
      {!isUser && message.mode && (
        <View style={styles.modeTagRow}>
          <CoachModeTag mode={message.mode} small />
        </View>
      )}
      <View style={styles.row}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>T</Text>
          </View>
        )}
        <View style={styles.bubble}>
          <Text style={styles.content}>{message.content}</Text>
        </View>
        {isUser && (
          <View style={[styles.avatar, styles.userAvatar]}>
            <Text style={styles.avatarText}>{studentName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Voice controls — only for assistant messages with content */}
      {!isUser && onSpeak && message.content.length > 0 && (
        <View style={styles.voiceRow}>
          {isSpeaking ? (
            /* ── Active: show animated indicator + Stop button ── */
            <>
              <View style={styles.speakingPill}>
                <Ionicons name="volume-high" size={14} color={colors.primary} />
                <Text style={[styles.speakingLabel, { color: colors.primary }]}>Speaking…</Text>
              </View>
              <Pressable
                onPress={onStop}
                style={({ pressed }) => [
                  styles.stopBtn,
                  { borderColor: colors.destructive, opacity: pressed ? 0.7 : 1 },
                ]}
                hitSlop={8}
                accessibilityLabel="Stop reading"
              >
                <Ionicons name="stop" size={12} color={colors.destructive} />
                <Text style={[styles.stopLabel, { color: colors.destructive }]}>Stop</Text>
              </Pressable>
            </>
          ) : (
            /* ── Idle: show Speak button ── */
            <Pressable
              onPress={handleSpeak}
              style={({ pressed }) => [styles.speakBtn, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={8}
              accessibilityLabel="Read this message aloud"
            >
              <Ionicons name="volume-medium-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.speakLabel, { color: colors.mutedForeground }]}>Speak</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>, isUser: boolean) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: 4,
      marginHorizontal: 12,
    },
    modeTagRow: {
      marginBottom: 4,
      marginLeft: 40,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: isUser ? 0 : 8,
      marginLeft: isUser ? 8 : 0,
      flexShrink: 0,
    },
    userAvatar: {
      backgroundColor: colors.accent,
    },
    avatarText: {
      color: '#FFFFFF',
      fontFamily: 'Inter_700Bold',
      fontSize: 13,
    },
    bubble: {
      maxWidth: '78%',
      backgroundColor: isUser ? colors.primary : colors.surface,
      borderRadius: 18,
      borderBottomLeftRadius: isUser ? 18 : 4,
      borderBottomRightRadius: isUser ? 4 : 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
      borderWidth: isUser ? 0 : 1,
      borderColor: colors.border,
    },
    content: {
      color: isUser ? '#FFFFFF' : colors.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 15,
      lineHeight: 22,
    },
    voiceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 40,
      marginTop: 4,
      gap: 8,
    },
    speakBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    speakLabel: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
    },
    speakingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    speakingLabel: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    stopBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    stopLabel: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
  });
