import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

const COLORS = {
  primary: '#3A8EFF', // New Blue
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  gradientEnd: '#2B6CD9', // Darker shade of the new blue for gradient
};

function AnimatedTabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withTiming(focused ? 1.2 : 1, { duration: 300 });
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

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
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
  );
}