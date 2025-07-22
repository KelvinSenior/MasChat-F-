import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform, ActivityIndicator, ScrollView, Pressable } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const COLORS = {
  primary: '#0A2463',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'users', label: 'Users' },
  { key: 'posts', label: 'Posts' },
  { key: 'reels', label: 'Reels' },
];

const SUGGESTIONS = [
  'Football', 'iPhone', 'Jobs', 'Fashion', 'Apartment', 'Music', 'Pets', 'Laptop', 'Car', 'Camera', 'Shoes', 'Books', 'Beauty', 'Bicycle', 'Services', 'Home',
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const stored = await AsyncStorage.getItem('recentSearches');
    if (stored) setRecent(JSON.parse(stored));
  };

  const saveRecent = async (q: string) => {
    let updated = [q, ...recent.filter(r => r !== q)].slice(0, 8);
    setRecent(updated);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecent = async () => {
    setRecent([]);
    await AsyncStorage.removeItem('recentSearches');
  };

  const handleSearch = async (q?: string) => {
    const searchTerm = typeof q === 'string' ? q : query;
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const [userRes, postRes, reelRes] = await Promise.all([
        client.get(`/users/search?query=${encodeURIComponent(searchTerm)}`),
        client.get(`/posts/search?query=${encodeURIComponent(searchTerm)}`),
        client.get(`/reels/search?query=${encodeURIComponent(searchTerm)}`),
      ]);
      setUsers(userRes.data);
      setPosts(postRes.data);
      setReels(reelRes.data);
      await saveRecent(searchTerm);
    } catch (e) {
      setUsers([]); setPosts([]); setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (type: string, item: any) => {
    if (type === 'user') {
      router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: item.id } });
    } else if (type === 'post') {
      router.push({ pathname: '/(tabs)/videos', params: { tab: 'Posts', postId: item.id } });
    } else if (type === 'reel') {
      router.push({ pathname: '/(tabs)/videos', params: { tab: 'Reels', reelId: item.id } });
    } else if (type === 'story') {
      router.push({ pathname: '/(tabs)/videos', params: { tab: 'Stories', storyId: item.id } });
    }
  };

  // Filtered results
  const showUsers = filter === 'all' || filter === 'users';
  const showPosts = filter === 'all' || filter === 'posts';
  const showReels = filter === 'all' || filter === 'reels';

  function highlight(text: string, term: string) {
    if (!term) return <Text>{text}</Text>;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return <Text>{parts.map((part, i) => part.toLowerCase() === term.toLowerCase() ? <Text key={i} style={{ backgroundColor: '#ffe082', fontWeight: 'bold' }}>{part}</Text> : part)}</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/home');
          }
        }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </LinearGradient>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, posts, reels..."
          placeholderTextColor={COLORS.lightText}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={{ marginLeft: 8 }}>
            <Ionicons name="close-circle" size={20} color={COLORS.lightText} />
          </TouchableOpacity>
        )}
      </View>
      {/* Suggestions & Recent */}
      {isSearchFocused && !query.trim() && (
        <ScrollView style={styles.suggestionsScroll}>
          {recent.length > 0 && (
            <View style={styles.suggestionSection}>
              <View style={styles.suggestionHeader}>
                <Text style={styles.suggestionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecent}><Text style={styles.clearBtn}>Clear</Text></TouchableOpacity>
              </View>
              {recent.map((r, i) => (
                <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => { setQuery(r); handleSearch(r); }}>
                  <Ionicons name="time-outline" size={18} color={COLORS.lightText} style={{ marginRight: 8 }} />
                  <Text style={styles.suggestionText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionTitle}>Suggestions</Text>
            <View style={styles.suggestionWrap}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => { setQuery(s); handleSearch(s); }}>
                  <Text style={styles.suggestionChipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Results */}
      {loading ? (
        <View style={{ padding: 24 }}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={{ backgroundColor: '#e4e6eb', borderRadius: 16, height: 60, marginBottom: 16, opacity: 0.5 }} />
          ))}
        </View>
      ) : (
        <ScrollView style={styles.resultsScroll}>
          {/* Users */}
          {showUsers && users.length > 0 && <Text style={styles.sectionTitle}>Users</Text>}
          {showUsers && users.map(user => (
            <Pressable key={user.id} style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.7 }]} onPress={() => handleResultPress('user', user)}>
              <Image source={{ uri: user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
              <View>
                <Text style={styles.resultTitle}>{highlight(user.fullName || user.username, query)}</Text>
                <Text style={styles.resultSub}>{highlight(user.username, query)}</Text>
              </View>
            </Pressable>
          ))}
          {/* Posts */}
          {showPosts && posts.length > 0 && <Text style={styles.sectionTitle}>Posts</Text>}
          {showPosts && posts.map(post => (
            <Pressable key={post.id} style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.7 }]} onPress={() => handleResultPress('post', post)}>
              <Ionicons name="document-text" size={28} color={COLORS.primary} style={styles.iconResult} />
              <View>
                <Text style={styles.resultTitle} numberOfLines={1}>{highlight(post.content, query)}</Text>
                <Text style={styles.resultSub}>{highlight(post.user?.username || '', query)}</Text>
              </View>
            </Pressable>
          ))}
          {/* Reels */}
          {showReels && reels.length > 0 && <Text style={styles.sectionTitle}>Reels</Text>}
          {showReels && reels.map(reel => (
            <Pressable key={reel.id} style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.7 }]} onPress={() => handleResultPress('reel', reel)}>
              <Image source={{ uri: reel.mediaUrl || 'https://i.imgur.com/6XbK6bE.jpg' }} style={styles.avatar} />
              <View>
                <Text style={styles.resultTitle} numberOfLines={1}>{highlight(reel.caption || reel.title || '', query)}</Text>
                <Text style={styles.resultSub}>{highlight(reel.user?.username || '', query)}</Text>
              </View>
            </Pressable>
          ))}
          {showUsers && users.length === 0 && showPosts && posts.length === 0 && showReels && reels.length === 0 && query.trim() !== '' && !loading && (
            <Text style={styles.noResults}>No results found. Try a different keyword or check the suggestions above!</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, backgroundColor: COLORS.primary },
  backBtn: { padding: 6, marginRight: 10 },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, margin: 16, paddingHorizontal: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 16 },
  suggestionsScroll: { maxHeight: 220, paddingHorizontal: 16 },
  suggestionSection: { marginBottom: 16 },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  suggestionTitle: { fontWeight: 'bold', color: COLORS.text, fontSize: 15 },
  clearBtn: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  suggestionText: { color: COLORS.text, fontSize: 15 },
  suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: { backgroundColor: '#e4e6eb', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  suggestionChipText: { color: COLORS.text, fontWeight: '500' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 4 },
  filterChip: { backgroundColor: '#e4e6eb', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.text, fontWeight: '500', fontSize: 14 },
  filterTextActive: { color: COLORS.white },
  resultsScroll: { flex: 1, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#eee' },
  iconResult: { marginRight: 12 },
  resultTitle: { fontWeight: 'bold', color: COLORS.text, fontSize: 16 },
  resultSub: { color: COLORS.lightText, fontSize: 13 },
  noResults: { color: COLORS.lightText, textAlign: 'center', marginTop: 32, fontSize: 16 },
});