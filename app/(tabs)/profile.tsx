import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/services/userService';

const DEFAULT_COVER_PHOTO = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
const DEFAULT_PROFILE_PHOTO = "https://i.imgur.com/6XbK6bE.jpg";

export default function Profile() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tabs = ['Posts', 'About', 'Videos', 'Photos', 'Events'];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const data = await getUserProfile(user.id);
        setProfileData(data);
        updateUser(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  console.log('User from AuthContext:', user);
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Please sign in to view profile</Text>
      </View>
    );
  }
  console.log('User from AuthContext:', user);


  if (loading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.coverContainer}>
        <Image 
          source={{ uri: profileData.coverPhoto || DEFAULT_COVER_PHOTO }} 
          style={styles.coverPhoto} 
        />
        
        <View style={styles.profilePicWrapper}>
          <Image 
            source={{ uri: profileData.profilePicture || DEFAULT_PROFILE_PHOTO }} 
            style={styles.profilePic} 
          />
          <TouchableOpacity 
            style={styles.cameraBtn}
            onPress={() => router.push("../screens/editProfile")}
          >
            <Ionicons name="camera" size={20} color="#222" />
          </TouchableOpacity>
        </View>

        <View style={styles.topIcons}>
          <TouchableOpacity 
            onPress={() => router.push("../screens/editProfile")} 
            style={{ backgroundColor: "#222", borderRadius: 16, padding: 6 }}
          >
            <Feather name="edit-2" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('../screens/SearchScreen')}>
            <Ionicons name="search" size={24} color="#1877f2" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.name}>
          {profileData.fullName || 'No name set'} 
          {profileData.verified && <Ionicons name="checkmark-circle" size={18} color="#1877f2" />}
        </Text>
        <Text style={styles.stats}>
          {profileData.details?.followerCount || 0} followers · {profileData.details?.followingCount || 0} following
        </Text>
        
        {profileData.bio && (
          <Text style={styles.bio}>{profileData.bio}</Text>
        )}

        <View style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.detailsSection}>
          {profileData.details?.worksAt1 && (
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={18} color="#222" />
              <Text style={styles.detailText}>Works at {profileData.details.worksAt1}</Text>
            </View>
          )}
          {profileData.details?.studiedAt && (
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={18} color="#222" />
              <Text style={styles.detailText}>Studied at {profileData.details.studiedAt}</Text>
            </View>
          )}
          {profileData.details?.currentCity && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#222" />
              <Text style={styles.detailText}>Lives in {profileData.details.currentCity}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverContainer: { position: "relative", height: 180, backgroundColor: "#eee" },
  coverPhoto: { width: "100%", height: "100%" },
  profilePicWrapper: { position: "absolute", left: 18, bottom: -48, borderRadius: 60, borderWidth: 4, borderColor: "#fff", backgroundColor: "#fff", zIndex: 2 },
  profilePic: { width: 96, height: 96, borderRadius: 48 },
  cameraBtn: { position: "absolute", right: -8, bottom: 8, backgroundColor: "#fff", borderRadius: 16, padding: 4, elevation: 2 },
  topIcons: { position: "absolute", right: 12, top: 12, flexDirection: "row", alignItems: "center", zIndex: 2 },
  iconBtn: { backgroundColor: "#fff", borderRadius: 16, padding: 6, marginLeft: 8, elevation: 2 },
  infoSection: { marginTop: 56, alignItems: "flex-start", paddingHorizontal: 18, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  name: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 2 },
  stats: { color: "#444", fontSize: 15, marginBottom: 8 },
  bio: { fontSize: 15, color: "#222", marginBottom: 8 },
  tabsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, marginTop: 18, borderBottomWidth: 1, borderBottomColor: "#eee" },
  tabButton: { paddingVertical: 6, paddingHorizontal: 16, marginRight: 8 },
  activeTab: { backgroundColor: "#e7f0fd", borderRadius: 16 },
  activeTabText: { color: "#1877f2", fontWeight: "bold" },
  tabText: { color: "#222", fontSize: 15 },
  detailsSection: { paddingTop: 18, paddingBottom: 32 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  detailText: { marginLeft: 8, fontSize: 15, color: "#222" },
});
