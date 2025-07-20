import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Alert
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { getBestFriends, Friend } from '../lib/services/userService';

// Color Palette
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const shortcuts = [
  { name: "Preety Shy", avatar: "https://randomuser.me/api/portraits/men/31.jpg" },
  { name: "Sarfo Kelvin", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
];

const menuOptions = [
  { label: "Friends", icon: <MaterialIcons name="people" size={24} color={COLORS.primary} /> },
  { label: "Dashboard", icon: <MaterialCommunityIcons name="view-dashboard" size={24} color={COLORS.primary} /> },
  { label: "Memories", icon: <MaterialIcons name="history" size={24} color={COLORS.primary} /> },
  { label: "Feeds", icon: <MaterialCommunityIcons name="rss" size={24} color={COLORS.primary} /> },
  { label: "Groups", icon: <FontAwesome5 name="users" size={24} color={COLORS.primary} /> },
  { label: "Marketplace", icon: <FontAwesome5 name="store" size={24} color={COLORS.primary} /> },
  { label: "Reels", icon: <Entypo name="video" size={24} color={COLORS.primary} /> },
  { label: "Saved", icon: <MaterialIcons name="bookmark" size={24} color="#A259E6" /> },
  { label: "Support", icon: <Ionicons name="heart-outline" size={26} color="#2196F3" /> },
  { label: "Ad Center", icon: <MaterialCommunityIcons name="bullhorn-outline" size={26} color="#2196F3" /> },
];

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bestFriends, setBestFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (user) {
      setLoading(false);
      // Fetch best friends
      getBestFriends(user.id)
        .then(setBestFriends)
        .catch(() => setBestFriends([]));
    }
  }, [user]);

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/screens/SettingsScreen')}>
            <Ionicons name="settings-sharp" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/screens/SearchScreen')}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push("/profile")}>
          <Image 
            source={{ uri: user?.profilePicture || "https://i.imgur.com/6XbK6bE.jpg" }} 
            style={styles.profileAvatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
            <Text style={styles.profileSubtext}>View your profile</Text>
          </View>
          <View style={styles.followerBadge}>
            <Text style={styles.followerText}>{user?.details?.followerCount || 0}+</Text>
          </View>
        </TouchableOpacity>

        {/* Shortcuts */}
        <Text style={styles.sectionTitle}>Your Shortcuts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcutsContainer}>
          {bestFriends.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.shortcutItem} onPress={() => router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: friend.id } })}>
              <Image source={{ uri: friend.profilePicture || 'https://i.imgur.com/6XbK6bE.jpg' }} style={styles.shortcutAvatar} />
              <Text style={styles.shortcutName}>{friend.fullName || friend.username}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuOptions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                if (item.label === 'Friends') router.push('/friends/FriendsScreen');
                else if (item.label === 'Marketplace') router.push('/(tabs)/marketplace');
                else if (item.label === 'Reels') router.push('/(create)/newReel');
                else if (item.label === 'Dashboard') router.push('/screens/DashboardScreen');
                else if (item.label === 'Memories') router.push('/screens/MemoriesScreen');
                else if (item.label === 'Feeds') router.push('/screens/FeedsScreen');
                else if (item.label === 'Groups') router.push('/screens/GroupsScreen');
                else if (item.label === 'Saved') router.push('/screens/SavedScreen');
                else if (item.label === 'Support') router.push('/screens/SupportScreen');
                else if (item.label === 'Ad Center') router.push('/screens/AdCenterScreen');
              }}
            >
              <View style={styles.menuIcon}>
                {item.icon}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => router.replace("/login") }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
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
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    paddingTop: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileSubtext: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
  },
  followerBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  followerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  shortcutsContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  shortcutItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  shortcutAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginBottom: 8,
  },
  shortcutName: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});