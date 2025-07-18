import { Slot } from "expo-router";
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AIChatModal from '../components/AIChatModal';
import FloatingAIButton from '../components/FloatingAIButton';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    return () => {
      setShowChat(false); // Cleanup on unmount
    };
  }, []);

  return (
    <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FloatingAIButton onPress={() => setShowChat(true)} />
            <AuthProvider>
              <Slot />
            </AuthProvider>
          <AIChatModal visible={showChat} onClose={() => setShowChat(false)} />
        </GestureHandlerRootView>
    </ThemeProvider>
  );
}
