import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform, ActivityIndicator } from "react-native";
import { useAuth } from '../context/AuthContext';
import { messageService, RecentChat } from '../lib/services/messageService';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function MessengerScreen() {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

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
    // Mark messages as read when opening chat
    await markAsRead(chat.id);
    
    router.push({ 
      pathname: "/screens/ChatScreen", 
      params: { recipient: JSON.stringify(chat) } 
    });
  };

  const filteredChats = chats.filter(chat => 
    chat.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    chat.username?.toLowerCase().includes(search.toLowerCase())
  );

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
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Messenger</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push("/(create)/newMessage")}
          >
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Ionicons name="home-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor={COLORS.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Chats List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={COLORS.lightText} />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySubtitle}>Start a conversation with friends</Text>
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
    backgroundColor: COLORS.background,
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
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
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
    borderColor: COLORS.white,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  chatMessage: {
    color: COLORS.lightText,
    fontSize: 14,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  chatDate: {
    color: COLORS.lightText,
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  unreadText: {
    color: COLORS.white,
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
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
  },
  newMessageBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  newMessageBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});