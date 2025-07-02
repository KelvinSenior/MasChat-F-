import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type FloatingAIButtonProps = {
  onPress: () => void;
};

export default function FloatingAIButton({ onPress }: FloatingAIButtonProps) {
  // Starting position (bottom right)
  const startingPosition = { x: width - 80, y: height - 180 };
  
  // Shared values for position
  const translateX = useSharedValue(startingPosition.x);
  const translateY = useSharedValue(startingPosition.y);
  
  // Track if button is pressed
  const isPressed = useSharedValue(false);
  const isHovered = useSharedValue(false);

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      // Calculate new position with boundaries
      const newX = e.absoluteX - 28; // 28 = half of button width
      const newY = e.absoluteY - 28; // 28 = half of button height
      
      // Keep within screen bounds
      translateX.value = Math.max(0, Math.min(newX, width - 56));
      translateY.value = Math.max(0, Math.min(newY, height - 56));
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(isPressed.value ? 0.9 : 1) },
    ],
    shadowOpacity: withTiming(isPressed.value ? 0.3 : 0.2),
    backgroundColor: withTiming(isPressed.value ? '#0f5fd6' : '#1877f2'),
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isPressed.value ? 0.9 : 1) },
      { rotate: withSpring(isHovered.value ? '0deg' : '0deg') },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        style={[styles.buttonContainer, animatedStyle]}
        onTouchStart={() => isHovered.value = true}
        onTouchEnd={() => isHovered.value = false}
      >
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <Ionicons
            name="sparkles" // Changed to a more AI-relevant icon
            size={24} // Smaller size
            color="#fff"
            onPress={onPress}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    elevation: 6,
    shadowColor: '#1877f2',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});