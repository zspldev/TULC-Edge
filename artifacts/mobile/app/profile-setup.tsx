import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useProfile } from '@/context/ProfileContext';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');

export default function ProfileSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setStudentName } = useProfile();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Please enter at least 2 characters.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setStudentName(trimmed);
    router.replace('/(tabs)');
  };

  const styles = makeStyles(colors, insets);

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      bottomOffset={40}
    >
      {/* Logo */}
      <Image
        source={require('../assets/images/tulc-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome text */}
      <View style={styles.textBlock}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Welcome to TULC</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your personal learning coach for Maharashtra SSC Std 8 — Science and Mathematics in
          English and Marathi.
        </Text>
      </View>

      {/* Name input */}
      <View style={styles.inputBlock}>
        <Text style={[styles.label, { color: colors.foreground }]}>What is your name?</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.foreground,
              backgroundColor: colors.card,
              borderColor: error ? colors.destructive : colors.border,
              fontFamily: 'Inter_400Regular',
            },
          ]}
          placeholder="e.g. Arjun, Priya..."
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError('');
          }}
          autoFocus
          autoCapitalize="words"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        ) : null}
      </View>

      {/* Continue button */}
      <Pressable
        onPress={handleContinue}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
          Start Learning
        </Text>
      </Pressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const makeStyles = (
  colors: ReturnType<typeof useColors>,
  insets: { top: number; bottom: number },
) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingTop: insets.top + 32,
      paddingBottom: insets.bottom + 24,
      paddingHorizontal: 28,
      alignItems: 'center',
      gap: 28,
    },
    logo: {
      width: width * 0.55,
      height: 90,
    },
    textBlock: {
      alignItems: 'center',
      gap: 10,
    },
    heading: {
      fontFamily: 'Inter_700Bold',
      fontSize: 26,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: 'Inter_400Regular',
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    inputBlock: {
      width: '100%',
      gap: 8,
    },
    label: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
    },
    input: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      borderWidth: 1.5,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    errorText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
    },
    button: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 16,
    },
  });
