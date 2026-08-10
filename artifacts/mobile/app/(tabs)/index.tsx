import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubjectCard from '@/components/SubjectCard';
import { SUBJECTS } from '@/constants/curriculum';
import { useProfile } from '@/context/ProfileContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();

  const greeting = profile?.name ? `Hello, ${profile.name.split(' ')[0]}` : 'Hello';

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>What do you want to study?</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Std 8 SSC Maharashtra
          </Text>
        </View>

        {/* Subject cards */}
        <View style={styles.subjects}>
          {SUBJECTS.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              chapterCount={subject.chapters.length}
              onPress={() => router.push(`/chapters/${subject.id}` as any)}
            />
          ))}
        </View>

        {/* Coaching hint */}
        <View style={[styles.hint, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.hintTitle, { color: colors.primary }]}>How TULC coaches you</Text>
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Pick a chapter and TULC will explain concepts, ask quiz questions, evaluate your
            answers, and adapt to what you need — in English or Marathi.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Platform.OS === 'web' ? 34 : 24,
    gap: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
  },
  greeting: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  subjects: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  hint: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  hintTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  hintText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
});
