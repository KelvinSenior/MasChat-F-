import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, useColorScheme, ScrollView, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from '../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { messageService, RecentChat } from '../lib/services/messageService';
import { BlurView } from 'expo-blur';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWebSocketUrl } from '../api/client';

// Color Palette (matching home screen)
const COLORS = {
  light: {
    primary: '#3A8EFF',  // Deep Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#333333',
    lightText: '#888888',
    card: '#FFFFFF',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#3A8EFF',  // Deep Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#1A1A2E', // Match marketplace dark background
    white: '#FFFFFF',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    card: '#2D2D44',       // Match marketplace dark card
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MessengerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function MessengerScreen({ navigation }: MessengerScreenProps) {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  const loadRecentChats = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const recentChats = await messageService.getRecentChats(user.id);
      setChats(recentChats);
    } catch (error) {
      console.error('Error loading recent chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadRecentChats();
    // Connect to WebSocket
    const socket = new SockJS(getWebSocketUrl());
    const client = new Client({
      webSocketFactory: () => socket,
      debug: str => console.log(str),
      onConnect: () => {
        client.subscribe(`/user/${user.id}/queue/messages`, message => {
          // On any new message, refresh recent chats
          loadRecentChats();
        });
      },
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [user?.id]);

  // Refresh chats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentChats();
    }, [user?.id])
  );

  const markAsRead = async (partnerId: string) => {
    if (!user?.id) return;
    try {
      await messageService.markAsRead(user.id, partnerId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleChatPress = async (chat: RecentChat) => {
    if (!chat?.id) {
      Alert.alert('Error', 'This chat is missing user information and cannot be opened.');
      return;
    }
    // Mark messages as read when opening chat
    await markAsRead(chat.id);
    // Defensive: always pass a full recipient object
    const recipient = {
      id: chat.id,
      username: chat.username,
      name: chat.fullName || chat.username,
      image: chat.profilePicture || '',
      profilePicture: chat.profilePicture || '',
      fullName: chat.fullName || '',
    };
    router.push({ 
      pathname: "/screens/ChatScreen", 
      params: { recipient: JSON.stringify(recipient) } 
    });
  };

  const filteredChats = chats
    .filter(chat => 
      chat.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      chat.username?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());

  const renderChatItem = ({ item }: { item: RecentChat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.chatImageContainer}>
        <Image 
          source={{ uri: item.profilePicture || 'https://i.imgur.com/6XbK6bE.jpg' }} 
          style={styles.chatImage} 
        />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.fullName || item.username}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatDate}>{formatDateTime(item.lastMessageTime)}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header matching Home screen */}
      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: colors.tabBarBg, borderBottomColor: colors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            <Text style={{ color: '#4361EE' }}>Mas</Text>
            <Text style={{ color: '#FF7F11' }}>Chat</Text>
          </Text>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/home')}>
              <Ionicons name="home" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/friends/SuggestionsScreen')}>
              <Ionicons name="person-add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
      {/* Stories Section */}
      <View style={{ paddingVertical: 8, backgroundColor: colors.background }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
          {/* Example: Replace with actual stories data */}
          {[...Array(8)].map((_, i) => (
            <View key={i} style={{ alignItems: 'center', marginRight: 16 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 3, borderColor: colors.accent }}>
                <Image source={{ uri: user?.profilePicture || 'https://i.imgur.com/6XbK6bE.jpg' }} style={{ width: 56, height: 56, borderRadius: 28 }} />
              </View>
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 4 }}>{user?.username || 'You'}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* Profile Info and Action Buttons */}
      <View style={[styles.profileInfoContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => router.push({ pathname: "/(tabs)/profile", params: { user: JSON.stringify({ id: user?.id, username: user?.username }) } })}
        >
          <Image 
            source={{ uri: user?.profilePicture || "https://randomuser.me/api/portraits/men/5.jpg" }} 
            style={styles.profilePic}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{user?.fullName || user?.username || 'User'}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.lightText }]}>Active now</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="call-outline" size={22} color={COLORS.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="videocam-outline" size={24} color={COLORS.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="home-outline" size={24} color={COLORS.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={COLORS.light.lightText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search messages"
            placeholderTextColor={colors.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Chats List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.lightText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Messages Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>Start a conversation with friends</Text>
              <TouchableOpacity 
                style={styles.newMessageBtn}
                onPress={() => router.push("/(create)/newMessage")}
              >
                <Text style={styles.newMessageBtnText}>New Message</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

function formatDateTime(isoString?: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.light.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.light.text,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.light.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chatImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  chatImage: {
    width: '100%',
    height: '100%',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#31a24c',
    borderWidth: 2,
    borderColor: COLORS.light.white,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    color: COLORS.light.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  chatMessage: {
    color: COLORS.light.lightText,
    fontSize: 14,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  chatDate: {
    color: COLORS.light.lightText,
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: COLORS.light.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  unreadText: {
    color: COLORS.light.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.light.lightText,
    marginTop: 8,
    textAlign: 'center',
  },
  newMessageBtn: {
    backgroundColor: COLORS.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  newMessageBtnText: {
    color: COLORS.light.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.light.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.light.lightText,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },

  mainHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 8,
  },
});