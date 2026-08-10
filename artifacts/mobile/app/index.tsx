import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/context/ProfileContext';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { isLoading, isFirstLaunch } = useProfile();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isFirstLaunch) {
        router.replace('/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [isLoading, isFirstLaunch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Top gradient accent */}
      <View style={styles.topAccent} />

      {/* Center content */}
      <View style={styles.center}>
        <Animated.View entering={FadeInDown.duration(700).delay(200)}>
          <Image
            source={require('../assets/images/tulc-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(600).delay(700)} style={styles.taglineContainer}>
          <Text style={styles.tagline}>Std 8 SSC Learning Coach</Text>
          <Text style={styles.languages}>English • मराठी</Text>
        </Animated.View>
      </View>

      {/* Bottom — "Created by" ZSPL */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(900)}
        style={styles.footer}
      >
        <Text style={styles.createdBy}>Created by</Text>
        <Image
          source={require('../assets/images/zspl-logo.png')}
          style={styles.zsplLogo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#F0F6FF',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  logo: {
    width: width * 0.72,
    height: 140,
  },
  taglineContainer: {
    alignItems: 'center',
    gap: 6,
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#5A6B82',
    letterSpacing: 0.3,
  },
  languages: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8899B4',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 28,
    gap: 8,
  },
  createdBy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#A0AABA',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  zsplLogo: {
    width: 160,
    height: 40,
  },
});
