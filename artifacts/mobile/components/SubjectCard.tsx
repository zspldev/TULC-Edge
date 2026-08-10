import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import type { SubjectInfo } from '@/constants/curriculum';

interface SubjectCardProps {
  subject: SubjectInfo;
  chapterCount: number;
  onPress: () => void;
}

export default function SubjectCard({ subject, chapterCount, onPress }: SubjectCardProps) {
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
      style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.92 : 1 }]}
    >
      <LinearGradient
        colors={[`${subjectColor}22`, `${subjectColor}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          { borderColor: `${subjectColor}30`, backgroundColor: colors.card },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${subjectColor}20` }]}>
          <Ionicons name={subject.icon as any} size={32} color={subjectColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.foreground }]}>{subject.title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subject.marathiTitle}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: `${subjectColor}18` }]}>
              <Text style={[styles.badgeText, { color: subjectColor }]}>
                {chapterCount} chapters
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginHorizontal: 16,
    marginVertical: 7,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});
