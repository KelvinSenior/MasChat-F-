import { Slot } from "expo-router";
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AIChatModal from '../components/AIChatModal';
import FloatingAIButton from '../components/FloatingAIButton';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    return () => {
      setShowChat(false); // Cleanup on unmount
    };
  }, []);

  return ( 
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: 'white' }}>
        <FloatingAIButton onPress={() => setShowChat(true)} />
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </SafeAreaView>
      <AIChatModal visible={showChat} onClose={() => setShowChat(false)} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
