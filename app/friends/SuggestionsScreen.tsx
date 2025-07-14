import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SuggestionCard from './SuggestionCard';

type Suggestion = {
  _id: string;
  fullName: string;
  profilePicture: string;
  mutualFriends: number;
};

export default function SuggestionsScreen() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8080/users/suggestions')
      .then(res => res.json())
      .then((data: Suggestion[]) => {
        setSuggestions(data);
        setLoading(false);
      });
  }, []);

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Suggestions</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>People you may know</Text>
      <ScrollView style={styles.scroll}>
        {loading ? <ActivityIndicator size="large" color="#1877f2" /> :
          suggestions.length === 0 ? <Text style={styles.emptyText}>No suggestions</Text> :
          suggestions.map(sug => <SuggestionCard key={sug._id} suggestion={sug} />)
        }
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  backBtn: { marginRight: 12 },
  backText: { color: '#1877f2', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' },
  searchBtn: { marginLeft: 12 },
  searchIcon: { fontSize: 22, color: '#222' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, color: '#222' },
  scroll: { flex: 1, paddingHorizontal: 8 },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#888' },
});
