import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, StatusBar, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { friendService, User } from '../lib/services/friendService';

// Color Palette (matching home/friends screens)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function NewMessage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadFriends();
      loadSuggestions();
    }
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;
    try {
      const friendsData = await friendService.getFriends(user.id);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadSuggestions = async () => {
    if (!user?.id) return;
    try {
      const suggestionsData = await friendService.getSuggestions(user.id);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const searchResults = await friendService.searchUsers(search.trim());
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId: string) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await friendService.sendFriendRequest(user.id, recipientId);
      // Refresh suggestions after sending request
      loadSuggestions();
      // Show success feedback (you can add a toast notification here)
      console.log('Friend request sent successfully');
    } catch (error) {
      console.error('Error sending friend request:', error);
      // Show error feedback
      console.log('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const startConversation = (recipient: User) => {
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(recipient) }
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => startConversation(item)}
    >
      <Image 
        source={{ uri: item.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
        style={styles.userAvatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName || item.username}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      {!item.isFriend && (
        <TouchableOpacity 
          style={styles.addFriendBtn}
          onPress={() => sendFriendRequest(item.id)}
          disabled={loading}
        >
          <Ionicons name="person-add" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={COLORS.lightText}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Search Results */}
        {search.trim() && (
          <>
            {renderSectionHeader('Search Results')}
            {users.map(user => (
              <View key={user.id} style={styles.userItem}>
                <Image 
                  source={{ uri: user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.userAvatar} 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName || user.username}</Text>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addFriendBtn}
                  onPress={() => sendFriendRequest(user.id)}
                  disabled={loading}
                >
                  <Ionicons name="person-add" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            ))}
            {users.length === 0 && search.trim() && !searchLoading && (
              <Text style={styles.noResults}>No users found</Text>
            )}
          </>
        )}

        {/* Friends */}
        {friends.length > 0 && !search.trim() && (
          <>
            {renderSectionHeader('Friends')}
            {friends.map(friend => (
              <TouchableOpacity 
                key={friend.id} 
                style={styles.userItem}
                onPress={() => startConversation(friend)}
              >
                <Image 
                  source={{ uri: friend.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.userAvatar} 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{friend.fullName || friend.username}</Text>
                  <Text style={styles.userUsername}>@{friend.username}</Text>
                </View>
                <TouchableOpacity style={styles.messageBtn}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && !search.trim() && (
          <>
            {renderSectionHeader('People You May Know')}
            {suggestions.map(suggestion => (
              <View key={suggestion.id} style={styles.userItem}>
                <Image 
                  source={{ uri: suggestion.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.userAvatar} 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{suggestion.fullName || suggestion.username}</Text>
                  <Text style={styles.userUsername}>@{suggestion.username}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addFriendBtn}
                  onPress={() => sendFriendRequest(suggestion.id)}
                  disabled={loading}
                >
                  <Ionicons name="person-add" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {!search.trim() && friends.length === 0 && suggestions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={COLORS.lightText} />
            <Text style={styles.emptyTitle}>No Friends Yet</Text>
            <Text style={styles.emptySubtitle}>Add friends to start messaging</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  userUsername: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 2,
  },
  addFriendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: COLORS.lightText,
    padding: 20,
    fontSize: 16,
  },
  emptyState: {
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
});