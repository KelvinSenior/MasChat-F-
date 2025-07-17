import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ComingSoon() {
  const router = useRouter();
  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🚀 Coming Soon 🚀</Text>
        <Text style={styles.subtitle}>This feature is coming soon. Stay tuned for updates!</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 24, alignSelf: 'center', padding: 12, backgroundColor: '#1877f2', borderRadius: 8}}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 16, elevation: 2 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1877f2', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#444', textAlign: 'center' },
}); 