import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { loadSessions, loadWeakConcepts, type SessionRecord, type WeakConcept } from '@/services/sessionStorage';

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadSessions(), loadWeakConcepts()]).then(([s, w]) => {
      setSessions(s);
      setWeakConcepts(w.filter((wc) => !wc.resolvedAt));
      setLoading(false);
    });
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const totalQuestions = sessions.reduce((acc, s) => acc + s.questionsAttempted, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.correctAnswers, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: Platform.OS === 'web' ? 34 : 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Your Progress</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Sessions', value: sessions.length, icon: 'book-outline' as const, color: colors.primary },
          { label: 'Questions', value: totalQuestions, icon: 'help-circle-outline' as const, color: colors.modeQuiz },
          { label: 'Accuracy', value: `${accuracy}%`, icon: 'checkmark-circle-outline' as const, color: colors.accent },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={stat.icon} size={22} color={stat.color} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Weak concepts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Concepts to Review
        </Text>
        {weakConcepts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle-outline" size={28} color={colors.accent} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {sessions.length === 0
                ? 'No sessions yet — start studying!'
                : 'No weak concepts identified. Keep it up!'}
            </Text>
          </View>
        ) : (
          weakConcepts.slice(0, 10).map((wc, i) => (
            <View
              key={i}
              style={[
                styles.conceptCard,
                { backgroundColor: colors.card, borderColor: `${colors.modeRemediate}30` },
              ]}
            >
              <View style={[styles.conceptDot, { backgroundColor: colors.modeRemediate }]} />
              <View style={styles.conceptText}>
                <Text style={[styles.conceptTopic, { color: colors.foreground }]}>{wc.topic}</Text>
                <Text style={[styles.conceptChapter, { color: colors.mutedForeground }]}>
                  {wc.subject} — {wc.chapter}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Sessions</Text>
          {sessions.slice(0, 5).map((session) => {
            const dur = session.endedAt
              ? Math.round((session.endedAt - session.startedAt) / 60000)
              : null;
            const acc = session.questionsAttempted > 0
              ? Math.round((session.correctAnswers / session.questionsAttempted) * 100)
              : null;
            return (
              <View
                key={session.id}
                style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.sessionMain}>
                  <Text style={[styles.sessionSubject, { color: colors.primary }]}>
                    {session.subjectTitle}
                  </Text>
                  <Text style={[styles.sessionChapter, { color: colors.foreground }]}>
                    {session.chapterTitle}
                  </Text>
                  <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>
                    {new Date(session.startedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={styles.sessionMeta}>
                  {dur !== null && (
                    <Text style={[styles.sessionStat, { color: colors.mutedForeground }]}>
                      {dur}m
                    </Text>
                  )}
                  {acc !== null && (
                    <Text style={[styles.sessionStat, { color: colors.accent }]}>
                      {acc}%
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    flex: 1,
  },
  conceptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  conceptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  conceptText: {
    flex: 1,
    gap: 2,
  },
  conceptTopic: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  conceptChapter: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sessionMain: {
    flex: 1,
    gap: 2,
  },
  sessionSubject: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionChapter: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  sessionDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  sessionMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sessionStat: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
});
