import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform } from "react-native";
import client, { BASE_URL } from '../api/client';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const RECENTS = [
  { 
    id: "1", 
    label: "Akanakoji Kyojiro", 
    icon: "time-outline", 
    color: "#888",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    type: "user"
  },
  { 
    id: "2", 
    label: "Friends", 
    icon: "people", 
    color: "#3b82f6",
    type: "group"
  },
  { 
    id: "3", 
    label: "Birthdays", 
    icon: "happy", 
    color: "#10b981",
    type: "event"
  },
  { 
    id: "4", 
    label: "Marketplace", 
    icon: "storefront", 
    color: "#f59e0b",
    type: "marketplace"
  },
  { 
    id: "5", 
    label: "Memories", 
    icon: "time", 
    color: "#8b5cf6",
    type: "memory"
  },
];

const SUGGESTIONS = [
  { id: "s1", label: "People you may know", icon: "person-add" },
  { id: "s2", label: "Popular posts", icon: "trending-up" },
  { id: "s3", label: "Live videos", icon: "videocam" },
  { id: "s4", label: "Gaming videos", icon: "game-controller" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await client.get(`/users/search?query=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearchPress = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.inputWrapper}
            activeOpacity={1}
          >
            <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search with Meta AI</Text>
          </TouchableOpacity>
          {isSearchFocused && (
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search with Meta AI"
                placeholderTextColor={COLORS.lightText}
                value={query}
                onChangeText={setQuery}
                autoFocus
                onBlur={handleSearchBlur}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}> 
                  <Ionicons name="close-circle" size={20} color={COLORS.lightText} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Recent Searches */}
      {!isSearchFocused && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent searches</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Edit</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={RECENTS}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item}>
                {item.type === "user" ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                )}
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Ionicons 
                  name="ellipsis-horizontal" 
                  size={20} 
                  color={COLORS.lightText} 
                  style={{ marginLeft: "auto" }} 
                />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Suggestions */}
      {!isSearchFocused && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          <FlatList
            data={SUGGESTIONS}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem}>
                <View style={styles.suggestionIcon}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.suggestionLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* User Search Results */}
      {isSearchFocused && query.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users</Text>
          {loading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : results.length === 0 ? (
            <Text style={styles.noResultsText}>No users found.</Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.id?.toString() || item.username}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.item} 
                  onPress={() => router.push({ pathname: '/(tabs)/profile', params: { user: JSON.stringify(item) } })}
                >
                  <Image 
                    source={{ uri: item.profilePicture || 'https://i.imgur.com/6XbK6bE.jpg' }} 
                    style={styles.itemImage} 
                  />
                  <Text style={styles.itemLabel}>{item.fullName || item.username}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* Quick Actions */}
      {!isSearchFocused && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Scan QR code</Text>
          </TouchableOpacity>
          <View style={styles.quickActionDivider} />
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="person-add" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Add friends</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingTop handled inline
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerIcon: { 
    padding: 6,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: COLORS.lightText,
  },
  searchInputContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    zIndex: 10,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  seeAll: { 
    color: COLORS.primary, 
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e7f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    margin: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAction: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  quickActionDivider: {
    width: 1,
    backgroundColor: "#e4e6eb",
  },
  loadingText: {
    padding: 16,
    color: COLORS.text,
  },
  noResultsText: {
    padding: 16,
    color: COLORS.lightText,
  },
});