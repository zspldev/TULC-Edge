import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { CoachingMode } from '@/services/aiTypes';
import CoachModeTag from './CoachModeTag';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: CoachingMode;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
  studentName: string;
}

export default function MessageBubble({ message, studentName }: MessageBubbleProps) {
  const colors = useColors();
  const isUser = message.role === 'user';

  const styles = makeStyles(colors, isUser);

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
  });
