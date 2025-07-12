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
  View
} from "react-native";
import { useAuth } from '../context/AuthContext';

const shortcuts = [
  {
    name: "Preety Shy",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
  },
  {
    name: "Sarfo Kelvin Senior",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

const menuOptions = [
  {
    label: "Friends",
    icon: <MaterialIcons name="people" size={24} color="#1877f2" />,
  },
  {
    label: "Professional dashboard",
    icon: <MaterialCommunityIcons name="view-dashboard" size={24} color="#1877f2" />,
  },
  {
    label: "Memories",
    icon: <MaterialIcons name="history" size={24} color="#1877f2" />,
  },
  {
    label: "Feeds",
    icon: <MaterialCommunityIcons name="rss" size={24} color="#1877f2" />,
  },
  {
    label: "Groups",
    icon: <FontAwesome5 name="users" size={24} color="#1877f2" />,
  },
  {
    label: "Marketplace",
    icon: <FontAwesome5 name="store" size={24} color="#1877f2" />,
  },
  {
    label: "Reels",
    icon: <Entypo name="video" size={24} color="#1877f2" />,
  },
  {
    label: "Saved",
    icon: <MaterialIcons name="bookmark" size={24} color="#a259e6" />,
  },
  { label: "Support", icon: <Ionicons name="heart-outline" size={26} color="#2196f3" /> },
  { label: "Ad Center", icon: <MaterialCommunityIcons name="bullhorn-outline" size={26} color="#2196f3" /> },
  { label: "Pages", icon: <MaterialCommunityIcons name="flag-outline" size={26} color="#f59e42" /> },
  { label: "Events", icon: <MaterialCommunityIcons name="calendar-star" size={26} color="#ef4444" /> },
  { label: "Games", icon: <MaterialCommunityIcons name="gamepad-variant-outline" size={26} color="#2196f3" /> },
  { label: "Finds", icon: <MaterialCommunityIcons name="tag-heart-outline" size={26} color="#ef4444" /> },
  { label: "Avatars", icon: <MaterialCommunityIcons name="emoticon-outline" size={26} color="#2196f3" /> },
  { label: "Messenger Kids", icon: <MaterialCommunityIcons name="message-bulleted" size={26} color="#22d3ee" /> },
];

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push('/screens/SettingsScreen')} style={styles.iconBtn}>
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.iconBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="settings-sharp" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/SearchScreen')} style={styles.iconBtn}>
            <LinearGradient 
              colors={['#667eea', '#764ba2']} 
              style={styles.iconBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="search" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Card */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.profileCard}
        >
          <LinearGradient
            colors={['#a18cd1', '#fbc2eb']}
            style={styles.profileAvatarBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={{ uri: user.profilePicture || "https://i.imgur.com/6XbK6bE.jpg" }} 
              style={styles.profileAvatar} 
            />
          </LinearGradient>
          <Text style={styles.profileName}>{user.fullName || 'User'}</Text>
          <View style={styles.profileBadgeWrap}>
            <Image source={{ uri: shortcuts[1].avatar }} style={styles.profileBadgeAvatar} />
            <LinearGradient 
              colors={['#ff416c', '#ff4b2b']} 
              style={styles.badgeCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.badgeText}>{user.details?.followerCount || 0}+</Text>
            </LinearGradient>
          </View>
        </TouchableOpacity>
        
        {/* Shortcuts */}
        <Text style={styles.sectionLabel}>Your shortcuts</Text>
        <View style={styles.shortcutsRow}>
          {shortcuts.map((item) => (
            <TouchableOpacity key={item.name} style={styles.shortcutItem}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.shortcutAvatarBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image source={{ uri: item.avatar }} style={styles.shortcutAvatar} />
              </LinearGradient>
              <Text style={styles.shortcutName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Meta AI Promo */}
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={styles.metaCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.metaRow}>
            <LinearGradient 
              colors={['#a259e6', '#8a2be2']} 
              style={styles.metaIconWrap}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="aperture-outline" size={24} color="white" />
            </LinearGradient>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={styles.metaTitle}>See what others are doing on the Meta AI app</Text>
          <Text style={styles.metaDesc}>Get inspired by how others are editing images and getting creative.</Text>
          <TouchableOpacity style={styles.metaBtn}>
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.metaBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.metaBtnText}>Download</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Menu Options Grid */}
        <View style={styles.menuGrid}>
          {menuOptions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuOption}
              onPress={() => {
                if (item.label === "Reels") {
                  router.push("/videos");
                } else if (item.label === "Marketplace") {
                  router.push("/(tabs)/marketplace");
                }
              }}
            >
              <LinearGradient 
                colors={['#f5f7fa', '#e4e8f0']} 
                style={styles.menuIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {item.icon}
              </LinearGradient>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/(auth)/login")}
        >
          <LinearGradient 
            colors={['#ff416c', '#ff4b2b']} 
            style={styles.logoutBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: 10
  },
  iconBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scroll: {
    flex: 1,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileAvatarBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'white'
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    fontFamily: 'sans-serif-medium'
  },
  profileBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  profileBadgeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: -10,
    zIndex: 2,
  },
  badgeCircle: {
    borderRadius: 12,
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
    zIndex: 1,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    fontFamily: 'sans-serif-medium'
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 12,
    fontFamily: 'sans-serif-medium'
  },
  shortcutsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 16,
  },
  shortcutItem: {
    alignItems: "center",
    marginRight: 20,
  },
  shortcutAvatarBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden'
  },
  shortcutAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'white'
  },
  shortcutName: {
    fontSize: 14,
    color: "#222",
    maxWidth: 80,
    textAlign: "center",
    fontFamily: 'sans-serif-medium'
  },
  metaCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metaIconWrap: {
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
    fontFamily: 'sans-serif-medium'
  },
  metaDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'sans-serif'
  },
  metaBtn: {
    borderRadius: 10,
    overflow: 'hidden'
  },
  metaBtnGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: 'center'
  },
  metaBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: 'sans-serif-medium'
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  menuOption: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "48%",
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  menuLabel: {
    fontSize: 15,
    color: "#222",
    textAlign: 'center',
    paddingHorizontal: 8,
    fontFamily: 'sans-serif-medium'
  },
  logoutBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
    marginHorizontal: 16,
  },
  logoutBtnGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'sans-serif-medium'
  },
});