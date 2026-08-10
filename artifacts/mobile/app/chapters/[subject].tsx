import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChapterItem from '@/components/ChapterItem';
import { getSubject } from '@/constants/curriculum';
import { useColors } from '@/hooks/useColors';

export default function ChapterPickerScreen() {
  const { subject: subjectId } = useLocalSearchParams<{ subject: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const subject = getSubject(subjectId ?? '');
  if (!subject) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Subject not found.</Text>
      </View>
    );
  }

  const subjectColor = isDark ? subject.darkColor : subject.color;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Chapter list */}
      <FlatList
        data={subject.chapters}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 67 : 0 }]}>
            <View style={[styles.subjectBadge, { backgroundColor: `${subjectColor}15` }]}>
              <Text style={[styles.subjectBadgeText, { color: subjectColor }]}>
                {subject.title} — {subject.marathiTitle}
              </Text>
            </View>
            <Text style={[styles.heading, { color: colors.foreground }]}>Choose a Chapter</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {subject.chapters.length} chapters · Std 8 SSC Maharashtra
            </Text>
          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        renderItem={({ item, index }) => (
          <ChapterItem
            chapter={item}
            subject={subject}
            isLast={index === subject.chapters.length - 1}
            onPress={() =>
              router.push(`/coach/${subjectId}/${item.id}` as any)
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              Platform.OS === 'web' ? 34 : insets.bottom + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  subjectBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  list: {
    paddingTop: 8,
  },
});
