import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/services/userService';

// Color Palette
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const DEFAULT_COVER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

export default function Profile() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = ['Posts', 'About', 'Videos', 'Photos'];

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getUserProfile(user.id);
      setProfileData(data);
      updateUser(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user?.id]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please sign in to view profile</Text>
      </View>
    );
  }

  if (loading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
            }}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: profileData.coverPhoto || DEFAULT_COVER }}
            style={styles.coverPhoto}
          />
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("../screens/editProfile")}
            >
              <Ionicons name="pencil-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("../screens/editProfile")}
            >
              <Ionicons name="settings" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("../screens/SearchScreen")}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View> 
        </View>

        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          <View style={styles.orangeRing}>
            <Image
              source={{ uri: profileData.profilePicture || DEFAULT_AVATAR }}
              style={styles.profilePic}
            />
          </View>
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={() => router.push("../screens/editProfile")}
          >
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>   
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profileData.fullName || 'User'}
            {profileData.verified && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={styles.verifiedBadge} />
            )}
          </Text>
          
          <Text style={styles.stats}>
            {profileData.details?.followerCount || 0} followers · {profileData.details?.followingCount || 0} following
          </Text>

          {profileData.bio && (
            <Text style={styles.bio}>{profileData.bio}</Text>
          )}

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Profile Details */}
          {activeTab === 'About' && (
            <View style={styles.detailsContainer}>
              {profileData.details?.worksAt1 && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="briefcase" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.detailText}>Works at {profileData.details.worksAt1}</Text>
                </View>
              )}
              
              {profileData.details?.studiedAt && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="school" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.detailText}>Studied at {profileData.details.studiedAt}</Text>
                </View>
              )}
              
              {profileData.details?.currentCity && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="location" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.detailText}>Lives in {profileData.details.currentCity}</Text>
                </View>
              )}
            </View>
          )}
        </View>
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
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  coverContainer: {
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  orangeRing: {
    borderWidth: 4,
    borderColor: COLORS.accent,
    borderRadius: 64,
    padding: 0,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  stats: {
    color: COLORS.lightText,
    marginBottom: 12,
  },
  bio: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  tabsContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#E7F0FD',
  },
  tabText: {
    color: COLORS.lightText,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  detailsContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    color: COLORS.text,
    flex: 1,
  },
});