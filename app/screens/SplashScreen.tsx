import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image, Text, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  secondary: '#3E92CC',
  dark: '#1A1A2E',
};

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const mottoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {

    // Animation sequence
    Animated.parallel([
      // Ring connection animation
      Animated.sequence([
        Animated.delay(300),
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
      ]),

      // Logo and text animations
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
        ]),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(mottoOpacity, {
            toValue: 1,
            duration: 800,
            delay: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated connection ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      >
        <Image
          source={require('../../assets/GROUP 88-MasChat.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Motto centered, original style, italic, animated */}
      <Animated.Text style={[styles.motto, styles.italic, { opacity: textOpacity, textAlign: 'center' }]}> 
        Limitless connection, limitless possibilities
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 16,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.6,
    textShadowColor: 'rgba(10, 36, 99, 0.25)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
    fontFamily: 'Helvetica Neue', // ✅ Replace with custom font if integrated
  },
  accent: {
    color: COLORS.accent,
  },
  welcome: {
    color: COLORS.secondary,
  },
  italic: {
    fontStyle: 'italic',
  },
  motto: {
    fontSize: 16,
    color: COLORS.secondary,
    letterSpacing: 0.8,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: 8,
  },
});
