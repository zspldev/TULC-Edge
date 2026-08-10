import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import type { Chapter, SubjectInfo } from '@/constants/curriculum';

interface ChapterItemProps {
  chapter: Chapter;
  subject: SubjectInfo;
  onPress: () => void;
  isLast?: boolean;
}

export default function ChapterItem({ chapter, subject, onPress, isLast = false }: ChapterItemProps) {
  const colors = useColors();
  const isDark = useColorScheme() === 'dark';
  const subjectColor = isDark ? subject.darkColor : subject.color;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={[styles.numberBadge, { backgroundColor: `${subjectColor}15` }]}>
        <Text style={[styles.number, { color: subjectColor }]}>{chapter.number}</Text>
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {chapter.title}
        </Text>
        <Text style={[styles.marathi, { color: colors.mutedForeground }]} numberOfLines={1}>
          {chapter.marathiTitle}
        </Text>
      </View>
      <Ionicons name="play-circle-outline" size={24} color={subjectColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  number: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  marathi: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
});
