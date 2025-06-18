import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
 

export default function RootLayout() {
  return ( 
        <SafeAreaProvider>
          <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 ,backgroundColor: 'white' }}>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </SafeAreaProvider>
  );
}
