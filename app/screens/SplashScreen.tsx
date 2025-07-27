import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image, Text, Dimensions, Easing, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const COLORS = {
  light: {
    primary: '#3A8EFF',
    accent: '#FF7F11',
    background: '#F5F7FA',
    white: '#FFFFFF',
    secondary: '#3E92CC',
    dark: '#1A1A2E',
    text: '#333333',
    lightText: '#666666',
  },
  dark: {
    primary: '#3A8EFF',
    accent: '#FF7F11',
    background: '#1A1A2E',
    white: '#FFFFFF',
    secondary: '#3E92CC',
    dark: '#0F0F1A',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
  },
};

export default function SplashScreen() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  // Animation refs
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const mottoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const backgroundFade = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Handle authentication state changes
    if (!isLoading) {
      if (user && token) {
        console.log('User is authenticated, redirecting to home');
        router.replace('/(tabs)/home');
      } else {
        console.log('User not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    }
  }, [user, token, isLoading, router]);

  useEffect(() => {
    // Enhanced animation sequence
    Animated.parallel([
      // Background fade in
      Animated.timing(backgroundFade, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // Ring connection animation with multiple pulses
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.8,
            duration: 1200,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 2.2,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Logo animations with rotation and glow
      Animated.sequence([
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(logoRotation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseScale, {
                toValue: 1.05,
                duration: 1500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(pulseScale, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]),

      // Text animations with staggered timing
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(mottoOpacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Animated.View style={{ opacity: backgroundFade }}>
            <Image
              source={require('../../assets/GROUP 88-MasChat.png')}
              style={[styles.loadingLogo, { shadowColor: colors.dark }]}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={[styles.loadingText, { color: colors.primary }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated background gradient effect */}
      <Animated.View
        style={[
          styles.backgroundGradient,
          {
            opacity: backgroundFade,
            backgroundColor: colors.primary,
          },
        ]}
      />

      {/* Multiple animated connection rings */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
            borderColor: colors.accent,
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: Animated.multiply(ringScale, 0.7) }],
            opacity: Animated.multiply(ringOpacity, 0.5),
            borderColor: colors.primary,
            borderWidth: 2,
          },
        ]}
      />

      {/* Glow effect behind logo */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            backgroundColor: colors.primary,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      {/* Logo with enhanced animations */}
      <Animated.View
        style={{
          transform: [
            { scale: logoScale },
            { rotate: spin },
            { scale: pulseScale },
          ],
          opacity: logoOpacity,
        }}
      >
        <Image
          source={require('../../assets/GROUP 88-MasChat.png')}
          style={[styles.logo, { shadowColor: colors.dark }]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Enhanced motto with animation */}
      <Animated.Text style={[
        styles.motto, 
        styles.italic, 
        { 
          opacity: mottoOpacity, 
          textAlign: 'center',
          color: colors.secondary,
          textShadowColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(10, 36, 99, 0.25)',
          transform: [{ scale: pulseScale }],
        }
      ]}> 
        Limitless connection, limitless possibilities
      </Animated.Text>

      {/* Floating particles effect */}
      <Animated.View
        style={[
          styles.particle,
          {
            opacity: Animated.multiply(glowOpacity, 0.6),
            backgroundColor: colors.accent,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle2,
          {
            opacity: Animated.multiply(glowOpacity, 0.4),
            backgroundColor: colors.primary,
            transform: [{ scale: Animated.multiply(pulseScale, 0.8) }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  ring: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 3,
  },
  glow: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    opacity: 0.2,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  loadingLogo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 1.6,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
    fontFamily: 'Helvetica Neue',
  },
  accent: {
    // Will be set dynamically
  },
  welcome: {
    // Will be set dynamically
  },
  italic: {
    fontStyle: 'italic',
  },
  motto: {
    fontSize: 16,
    letterSpacing: 0.8,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: 8,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: height * 0.3,
    right: width * 0.2,
  },
  particle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    bottom: height * 0.3,
    left: width * 0.15,
  },
});
