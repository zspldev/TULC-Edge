import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { CoachingMode } from '@/services/aiTypes';
import { COACHING_MODE_LABELS } from '@/services/aiTypes';

interface CoachModeTagProps {
  mode: CoachingMode;
  small?: boolean;
}

const MODE_ICONS: Record<CoachingMode, keyof typeof Ionicons.glyphMap> = {
  explain: 'book-outline',
  simplify: 'bulb-outline',
  example: 'cube-outline',
  reteach: 'refresh-outline',
  quiz: 'help-circle-outline',
  evaluate: 'checkmark-circle-outline',
  teachBack: 'mic-outline',
  remediate: 'construct-outline',
  revise: 'repeat-outline',
};

const MODE_COLOR_KEYS: Record<CoachingMode, string> = {
  explain: 'modeExplain',
  simplify: 'modeSimplify',
  example: 'modeExample',
  reteach: 'modeReteach',
  quiz: 'modeQuiz',
  evaluate: 'modeEvaluate',
  teachBack: 'modeTeachBack',
  remediate: 'modeRemediate',
  revise: 'modeRevise',
};

export default function CoachModeTag({ mode, small = false }: CoachModeTagProps) {
  const colors = useColors();
  const colorKey = MODE_COLOR_KEYS[mode] as keyof typeof colors;
  const modeColor = (colors[colorKey] as string) ?? colors.primary;
  const iconName = MODE_ICONS[mode];
  const label = COACHING_MODE_LABELS[mode];

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: `${modeColor}18`,
          borderColor: `${modeColor}40`,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 5,
        },
      ]}
    >
      <Ionicons name={iconName} size={small ? 11 : 13} color={modeColor} />
      <Text
        style={[
          styles.label,
          { color: modeColor, fontFamily: 'Inter_600SemiBold', fontSize: small ? 10 : 12 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    letterSpacing: 0.2,
  },
});
