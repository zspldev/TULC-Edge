import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatInput from '@/components/ChatInput';
import CoachModeTag from '@/components/CoachModeTag';
import { type Message } from '@/components/MessageBubble';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import { getChapter, getSubject } from '@/constants/curriculum';
import { useProfile } from '@/context/ProfileContext';
import { useSession } from '@/context/SessionContext';
import type { CoachingMode } from '@/services/aiTypes';
import { buildCoachingInstruction } from '@/services/coachEngine';
import { detectLanguage } from '@/services/languageDetect';
import { getAIEngine, voiceSupported } from '@/services/openrouterEngine';
import { getAPIServerEngine } from '@/services/apiServerEngine';
import { useColors } from '@/hooks/useColors';

let messageCounter = 0;
function makeId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 6)}`;
}

const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ?? '';

export default function CoachChatScreen() {
  const { subject: subjectId, chapter: chapterId } = useLocalSearchParams<{
    subject: string;
    chapter: string;
  }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { profile } = useProfile();
  const { session, startSession, updateMode, addWeakConcept, addConceptCovered, endSession } =
    useSession();

  const subject = getSubject(subjectId ?? '');
  const chapter = getChapter(subjectId ?? '', chapterId ?? '');

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentMode, setCurrentMode] = useState<CoachingMode>('explain');
  const [initialized, setInitialized] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const currentModeRef = useRef<CoachingMode>('explain');
  const messagesRef = useRef<Message[]>([]);
  const initRef = useRef(false);
  // Curriculum context: starts with static placeholder, upgraded to ZKE content async
  const curriculumContextRef = useRef<string>(chapter?.context ?? '');

  const subjectColor = isDark ? subject?.darkColor : subject?.color;
  const studentName = profile?.name ?? 'Student';

  // Start session, fetch ZKE context, then send first coaching message
  useEffect(() => {
    if (!subject || !chapter || initRef.current) return;
    initRef.current = true;

    // Seed ref with static placeholder immediately
    curriculumContextRef.current = chapter.context;

    startSession(subjectId!, chapterId!, subject.title, chapter.title, chapter.title);

    // Fire-and-forget: upgrade context from ZKE RAG before first coach message
    const initAsync = async () => {
      try {
        const serverEngine = getAPIServerEngine();
        const zkeContext = await serverEngine.fetchCurriculumContext(
          subject.title,
          chapter.title,
          chapter.id,
        );
        if (zkeContext) {
          curriculumContextRef.current = zkeContext;
        }
      } catch {
        // ZKE unavailable — static placeholder is still in the ref, coaching continues
      }
      sendCoachMessage('', 'explain', []);
      setInitialized(true);
    };

    initAsync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, chapter]);

  const sendCoachMessage = useCallback(
    async (
      studentText: string,
      mode: CoachingMode,
      history: Message[],
    ) => {
      if (!chapter || !subject) return;

      setIsStreaming(true);
      setShowTyping(true);

      const engine = getAIEngine();
      const lang = studentText ? detectLanguage(studentText) : 'en';
      const instruction = buildCoachingInstruction(
        mode,
        chapter.title,
        [],
        chapter.title,
      );

      const chatHistory = history
        .slice(-16)
        .filter((m) => m.role !== 'assistant' || m.content.length > 0)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      let fullContent = '';
      let assistantAdded = false;
      let msgId = makeId();

      try {
        const response = await engine.generate(
          {
            studentQuestion: studentText,
            detectedLanguage: lang,
            curriculumContext: curriculumContextRef.current,
            coachingInstruction: instruction,
            conversationHistory: chatHistory,
            studentName,
            subject: subject.title,
            chapter: chapter.title,
          },
          (chunk) => {
            fullContent += chunk;
            // Strip [NEXT_MODE:xxx] from displayed text in real-time
            const displayText = fullContent.replace(/\[NEXT_MODE:\w+\]/gi, '').trim();

            setShowTyping(false);

            if (!assistantAdded) {
              assistantAdded = true;
              const assistantMsg: Message = {
                id: msgId,
                role: 'assistant',
                content: displayText,
                mode,
                timestamp: Date.now(),
              };
              setMessages((prev) => {
                const next = [...prev, assistantMsg];
                messagesRef.current = next;
                return next;
              });
            } else {
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.id === msgId) {
                  updated[lastIdx] = { ...updated[lastIdx], content: displayText };
                }
                messagesRef.current = updated;
                return updated;
              });
            }
          },
        );

        // Apply next mode from LLM response
        const nextMode = response.nextMode;
        currentModeRef.current = nextMode;
        setCurrentMode(nextMode);
        updateMode(nextMode);

        // Track weak concepts if remediating
        if (mode === 'remediate' || mode === 'evaluate') {
          addWeakConcept(chapter.title);
        }
        if (mode === 'explain' || mode === 'reteach') {
          addConceptCovered(chapter.title);
        }
      } catch (err: any) {
        setShowTyping(false);
        // Surface a meaningful message rather than a generic "check internet" fallback.
        // Rate-limit errors from OpenRouter come through as messages containing "rate-limit"
        // or "429"; everything else is treated as a transient server error.
        const msg = err?.message ?? '';
        const isRateLimit = msg.includes('rate-limit') || msg.includes('rate_limit') || msg.includes('429');
        const displayError = isRateLimit
          ? 'The AI is temporarily busy — please wait a moment and try again.'
          : 'Something went wrong. Please try again.';
        const errMsg: Message = {
          id: makeId(),
          role: 'assistant',
          content: displayError,
          mode: currentModeRef.current,
          timestamp: Date.now(),
        };
        setMessages((prev) => {
          const next = [...prev, errMsg];
          messagesRef.current = next;
          return next;
        });
      } finally {
        setIsStreaming(false);
        setShowTyping(false);
      }
    },
    [chapter, subject, studentName, updateMode, addWeakConcept, addConceptCovered],
  );

  const handleSend = useCallback(
    (text: string) => {
      if (isStreaming || sessionEnded) return;

      const currentMsgs = [...messagesRef.current];

      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      const newHistory = [...currentMsgs, userMsg];
      setMessages(newHistory);
      messagesRef.current = newHistory;

      sendCoachMessage(text, currentModeRef.current, newHistory);
    },
    [isStreaming, sessionEnded, sendCoachMessage],
  );

  const handleVoiceTranscript = useCallback(
    async (audioUri: string) => {
      if (isStreaming || isTranscribing) return;
      setIsTranscribing(true);
      try {
        const engine = getAIEngine();
        const transcript = await engine.transcribeAudio(audioUri);
        if (transcript.trim()) {
          handleSend(transcript.trim());
        }
      } catch (err: any) {
        // Show a visible error bubble so the user knows what happened
        const errMsg: Message = {
          id: makeId(),
          role: 'assistant',
          content: `Voice transcription failed: ${err?.message ?? 'unknown error'}. Please type your question.`,
          mode: currentModeRef.current,
          timestamp: Date.now(),
        };
        setMessages((prev) => {
          const next = [...prev, errMsg];
          messagesRef.current = next;
          return next;
        });
      } finally {
        setIsTranscribing(false);
      }
    },
    [isStreaming, isTranscribing, handleSend],
  );

  const handleEndSession = async () => {
    setSessionEnded(true);
    await endSession();
    router.back();
  };

  if (!subject || !chapter) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Chapter not found.</Text>
      </View>
    );
  }

  const reversedMessages = [...messages].reverse();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === 'web' ? 67 : insets.top,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerSubject, { color: subjectColor ?? colors.primary }]}>
            {subject.title}
          </Text>
          <Text style={[styles.headerChapter, { color: colors.foreground }]} numberOfLines={1}>
            {chapter.title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <CoachModeTag mode={currentMode} small />
          <Pressable
            onPress={handleEndSession}
            style={({ pressed }) => [styles.endBtn, { opacity: pressed ? 0.7 : 1 }]}
            hitSlop={8}
          >
            <Ionicons name="stop-circle-outline" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} studentName={studentName} />
          )}
          inverted={!!messages.length}
          ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
          ListFooterComponent={<View style={{ height: 8 }} />}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!!messages.length}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            initialized ? null : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                  Preparing your lesson...
                </Text>
              </View>
            )
          }
        />
        <ChatInput
          onSend={handleSend}
          onVoiceTranscript={voiceSupported() ? handleVoiceTranscript : undefined}
          disabled={isStreaming || !initialized}
          isTranscribing={isTranscribing}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    padding: 4,
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerSubject: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerChapter: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  endBtn: {
    padding: 4,
  },
  listContent: {
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 80,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
});
