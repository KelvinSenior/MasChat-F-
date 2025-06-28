import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
      <Ionicons name={name} color={color} size={30} />
    </Animated.View>
  );
}



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          backgroundColor: 'black',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarIconStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
        },
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