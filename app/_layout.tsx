import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return ( 
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: 'white' }}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
