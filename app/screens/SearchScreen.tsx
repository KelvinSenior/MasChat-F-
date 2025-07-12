import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
    icon: "cake", 
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
  const router = useRouter();

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search with Meta AI"
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Recent Searches */}
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
                color="#888" 
                style={{ marginLeft: "auto" }} 
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Suggestions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggestions</Text>
        <FlatList
          data={SUGGESTIONS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestionItem}>
              <View style={styles.suggestionIcon}>
                <Ionicons name={item.icon as any} size={20} color="#1877f2" />
              </View>
              <Text style={styles.suggestionLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#1877f2" />
          <Text style={styles.quickActionText}>Scan QR code</Text>
        </TouchableOpacity>
        <View style={styles.quickActionDivider} />
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="person-add" size={24} color="#1877f2" />
          <Text style={styles.quickActionText}>Add friends</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerIcon: { 
    padding: 6,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: "#222",
    fontFamily: 'sans-serif'
  },
  section: {
    backgroundColor: "#fff",
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
    shadowRadius: 3,
    elevation: 2,
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
    color: "#222",
    fontFamily: 'sans-serif-medium'
  },
  seeAll: { 
    color: "#1877f2", 
    fontSize: 14,
    fontFamily: 'sans-serif-medium'
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
    color: "#222",
    fontFamily: 'sans-serif'
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
    backgroundColor: "#e7f3ff",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionLabel: {
    fontSize: 16,
    color: "#222",
    fontFamily: 'sans-serif'
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAction: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#1877f2",
    marginTop: 4,
    fontFamily: 'sans-serif-medium'
  },
  quickActionDivider: {
    width: 1,
    backgroundColor: "#e4e6eb",
  },
});