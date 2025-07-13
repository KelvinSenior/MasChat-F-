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
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated,
{
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/services/userService';

const DEFAULT_COVER_PHOTO = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
const DEFAULT_PROFILE_PHOTO = "https://randomuser.me/api/portraits/men/1.jpg";

export default function Profile() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values for swipe gesture
  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  const tabs = ['Posts', 'About', 'Videos', 'Photos', 'Events'];

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

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startX: number }) => {
      ctx.startX = translateX.value;
      isSwiping.value = true;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: () => {
      if (Math.abs(translateX.value) > 50 && profileData?.details?.avatarSwipeEnabled) {
        translateX.value = withSpring(translateX.value > 0 ? 100 : -100);
      } else {
        translateX.value = withSpring(0);
      }
      isSwiping.value = false;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: isSwiping.value ? 0.8 : 1,
    };
  });

  const avatarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: Math.abs(translateX.value) / 100,
    };
  });

  if (!user) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please sign in to view profile</Text>
      </LinearGradient>
    );
  }

  if (loading || !profileData) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877f2" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1877f2']}
            tintColor="#1877f2"
          />
        }
      >
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: profileData.coverPhoto || DEFAULT_COVER_PHOTO }}
            style={styles.coverPhoto}
          />

          {/* Top Right Buttons */}
          <View style={styles.topIcons}>
            <TouchableOpacity
              onPress={() => router.push("../screens/editProfile")}
              style={styles.editBtn}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.editBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="edit-2" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('../screens/SearchScreen')}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.iconBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="search" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Picture with Swipe Animation */}
        <View style={styles.profilePicContainer}>
          <View style={styles.profilePicWrapper}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={animatedStyle}>
                <Image
                  source={{
                    uri: (profileData.details?.showAvatar && profileData.details?.avatar)
                      ? profileData.details.avatar
                      : (profileData.profilePicture || DEFAULT_PROFILE_PHOTO)
                  }}
                  style={styles.profilePic}
                />
              </Animated.View>
            </PanGestureHandler>

            {profileData.details?.avatarSwipeEnabled && (
              <Animated.View style={[styles.avatarPic, avatarStyle]}>
                <Image
                  source={{ uri: profileData.details?.avatar || DEFAULT_PROFILE_PHOTO }}
                  style={styles.profilePic}
                />
              </Animated.View>
            )}

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => router.push("../screens/editProfile")}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.cameraBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>
            {profileData.username || 'No name set'}
            {profileData.verified && <Ionicons name="checkmark-circle" size={18} color="#1877f2" style={styles.verifiedBadge} />}
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
                style={[styles.tabButton, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Profile Details */}
          {activeTab === 'About' && (
            <View style={styles.detailsSection}>
              {profileData.details?.profileType && (
                <Text style={styles.detailText}>Profile Type: {profileData.details.profileType}</Text>
              )}
              {profileData.details?.worksAt1 && (
                <Text style={styles.detailText}>Works at: {profileData.details.worksAt1}</Text>
              )}
              {profileData.details?.studiedAt && (
                <Text style={styles.detailText}>Studied at: {profileData.details.studiedAt}</Text>
              )}
              {profileData.details?.currentCity && (
                <Text style={styles.detailText}>Lives in: {profileData.details.currentCity}</Text>
              )}
              {profileData.details?.relationshipStatus && (
                <Text style={styles.detailText}>Relationship: {profileData.details.relationshipStatus}</Text>
              )}
              {/* Add more fields as needed */}
            </View>
          )}

          <View style={styles.detailsSection}>
            {profileData.details?.worksAt1 && (
              <View style={styles.detailRow}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.detailIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="briefcase-outline" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.detailText}>Works at {profileData.details.worksAt1}</Text>
              </View>
            )}
            {profileData.details?.studiedAt && (
              <View style={styles.detailRow}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.detailIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="school-outline" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.detailText}>Studied at {profileData.details.studiedAt}</Text>
              </View>
            )}
            {profileData.details?.currentCity && (
              <View style={styles.detailRow}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.detailIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="location-outline" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.detailText}>Lives in {profileData.details.currentCity}</Text>
              </View>
            )}
            {profileData.details?.relationshipStatus && (
              <View style={styles.detailRow}>
                <LinearGradient
                  colors={['#ff758c', '#ff7eb3']}
                  style={styles.detailIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="heart-outline" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.detailText}>{profileData.details.relationshipStatus}</Text>
              </View>
            )}
          </View>
        </View>
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
  loadingText: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'sans-serif-medium'
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    position: "relative",
    height: 180,
    backgroundColor: "#eee",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden'
  },
  coverPhoto: {
    width: "100%",
    height: "100%"
  },
  profilePicContainer: {
    paddingHorizontal: 20,
    marginTop: -50,
  },
  profilePicWrapper: {
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
    zIndex: 2,
    overflow: 'hidden',
    width: 150,
    height: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'center',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  avatarPic: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  cameraBtn: {
    position: "absolute",
    right: 8,
    bottom: 8,
    borderRadius: 18,
    overflow: 'hidden'
  },
  cameraBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  topIcons: {
    position: "absolute",
    right: 16,
    top: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2
  },
  editBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 10
  },
  editBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconBtn: {
    borderRadius: 18,
    overflow: 'hidden'
  },
  iconBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoSection: {
    marginTop: 20,
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center',
    width: '100%',
  },
  verifiedBadge: {
    marginLeft: 6
  },
  stats: {
    color: "#666",
    fontSize: 15,
    marginBottom: 12,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    width: '100%',
  },
  bio: {
    fontSize: 15,
    color: "#222",
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#e7f0fd",
  },
  activeTabText: {
    color: "#1877f2",
    fontWeight: "bold"
  },
  tabText: {
    color: "#666",
    fontSize: 15,
    fontFamily: 'sans-serif-medium'
  },
  detailsSection: {
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e4e6eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
    marginBottom: 20
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  detailIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  detailText: {
    fontSize: 15,
    color: "#222",
    fontFamily: 'sans-serif'
  },
});