import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Dimensions } from 'react-native';

const COLORS = {
  primary: '#0A2463', // Deep Blue
  accent: '#FF7F11', // Vibrant Orange
  gradientEnd: '#1A4B8C',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

// Fix: Use a function component with correct props typing
function AnimatedTabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  // Fix: useSharedValue must be called only once, not on every render
  const scale = useSharedValue(1);

  // Fix: useEffect to animate on focused change
  React.useEffect(() => {
    scale.value = withTiming(focused ? 1.2 : 1, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: focused ? 1 : 0.7,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {focused && (
        <View style={{
          position: 'absolute',
          top: -8,
          left: 0,
          right: 0,
          height: 4,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          backgroundColor: COLORS.accent,
          zIndex: 2,
        }} />
      )}
      <Ionicons name={name} color={focused ? COLORS.accent : COLORS.white} size={30} />
    </Animated.View>
  );
}

const TAB_KEYS = [
  'home',
  'videos',
  'marketplace',
  'notifications',
  'profile',
  'menu',
];

type SlideTransitionProps = {
  position: Animated.SharedValue<number>;
  children: React.ReactNode;
  direction: 'left' | 'right';
};

function SlideTransition({ position, children, direction }: SlideTransitionProps) {
  const width = Dimensions.get('window').width;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: withTiming(position.value * width * (direction === 'left' ? 1 : -1), { duration: 350 })
    }],
  }));
  return <Animated.View style={[{ flex: 1, position: 'absolute', width: '100%', height: '100%' }, animatedStyle]}>{children}</Animated.View>;
}

export default function TabLayout() {
  const prevTab = useRef(0);
  const currentTab = useRef(0);
  const position = useSharedValue(0);

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tabIndex = TAB_KEYS.indexOf(route.name);
        return {
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            backgroundColor: 'transparent',
            borderTopColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarIconStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={[COLORS.primary, COLORS.gradientEnd]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ),
        };
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="videocam" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="cart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="notifications" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="person-circle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="menu" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}