import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native';
import FriendCard from './FriendCard';
import { useAuth } from '../context/AuthContext';
import { friendService } from '../lib/services/friendService';
import { useFocusEffect } from '@react-navigation/native';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchFriends = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await friendService.getFriends(user.id);
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [user?.id])
  );

  const uniqueFriends = Array.from(new Map(friends.map(f => [f.id, f])).values());
  const filteredFriends = uniqueFriends.filter(f => 
    f.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }
    if (filteredFriends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>
            {search ? 'No friends found matching your search' : 'No friends yet'}
          </Text>
          {!search && (
            <TouchableOpacity 
              style={styles.addFriendsButton}
              onPress={() => router.push('/friends/SuggestionsScreen')}
            >
              <LinearGradient
                colors={[COLORS.accent, '#FF9E40']}
                style={styles.addFriendsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addFriendsText}>Find Friends</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return filteredFriends.map(friend => (
      <View key={friend.id} style={styles.friendItem}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: friend.id } })}>
          <Image 
            source={{ uri: friend.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.friendAvatar} 
          />
        </TouchableOpacity>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.fullName || friend.username}</Text>
          <Text style={styles.friendUsername}>@{friend.username}</Text>
        </View>
        <TouchableOpacity style={styles.messageButton} onPress={() => router.push({ pathname: '/screens/ChatScreen', params: { recipient: JSON.stringify({ id: friend.id, username: friend.username, fullName: friend.fullName, profilePicture: friend.profilePicture }) } })}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    ));
  };

  // AI image generation for friendship badge
  const generateAIFriendBadge = async () => {
    Alert.prompt('AI Friendship Badge', 'Describe a fun badge or image for your friends:', async (prompt) => {
      if (!prompt) return;
      setAiLoading(true);
      try {
        const url = 'https://open-ai21.p.rapidapi.com/texttoimage2';
        const options = {
          method: 'POST',
          headers: {
            'x-rapidapi-key': '355060685fmsh742abd58eb438d7p1f4d66jsn22cd506769c9',
            'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: prompt }),
        };
        const response = await fetch(url, options);
        const result = await response.json();
        if (result && result.generated_image) {
          setAiImage(result.generated_image);
        } else {
          Alert.alert('Error', 'Failed to generate image.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to generate image.');
      } finally {
        setAiLoading(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2B6CD9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/menu');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={COLORS.lightText}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.lightText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          <TouchableOpacity 
            style={[styles.tabButton, styles.tabButtonActive]}
            onPress={() => {}}
          >
            <Text style={[styles.tabText, styles.tabTextActive]}>All Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => router.push('/friends/SuggestionsScreen')}
          >
            <Text style={styles.tabText}>Suggestions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabButton}
            onPress={() => router.push('/friends/FriendRequestsScreen')}
          >
            <Text style={styles.tabText}>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={generateAIFriendBadge} disabled={aiLoading}>
            <Ionicons name="sparkles" size={18} color={COLORS.accent} />
            <Text style={styles.tabText}>AI Badge</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Friends Count */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filteredFriends.length} {filteredFriends.length === 1 ? 'friend' : 'friends'}
        </Text>
      </View>

      {/* Friends List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {renderContent()}
        {aiImage && (
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginBottom: 8 }}>Your AI Badge</Text>
            <Image source={{ uri: aiImage }} style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: COLORS.accent }} />
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  clearButton: {
    marginLeft: 8,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#e7f0fd',
  },
  tabText: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: "500",
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  sectionHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  addFriendsButton: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addFriendsGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFriendsText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
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
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f2f5',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
