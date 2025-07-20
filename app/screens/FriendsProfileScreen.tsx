import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/services/userService';
import { getPosts, Post } from '../lib/services/postService';
import { fetchReels, Reel } from '../lib/services/reelService';
import { friendService } from '../lib/services/friendService';
import client from '../api/client';

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

export default function FriendsProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaModal, setMediaModal] = useState<{ type: 'photo' | 'video' | 'reel', uri: string, postId?: string, reelId?: string } | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const tabs = ['Posts', 'About', 'Videos', 'Photos'];
  const targetUserId = params.userId as string;

  const fetchProfile = async () => {
    if (!targetUserId) return;
    try {
      setLoading(true);
      const data = await getUserProfile(targetUserId);
      setProfileData(data);
      
      // Fetch posts and reels for this user
      const allPosts = await getPosts();
      setUserPosts(allPosts.filter((p: Post) => p.user.id === targetUserId));
      const allReels = await fetchReels();
      setUserReels(allReels.filter((r: Reel) => r.userId === targetUserId));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFriendStatus = async () => {
    if (!user || !targetUserId) return;
    // Fetch friends
    const friendsRes = await client.get(`/friends/list/${user.id}`);
    setIsFriend(friendsRes.data.some((f: any) => f.id === targetUserId));
    // Fetch pending requests
    const pendingRes = await client.get(`/friends/pending/${user.id}`);
    setPendingRequests(pendingRes.data);
    setRequestSent(pendingRes.data.some((r: any) => r.sender.id === user.id && r.receiver.id === targetUserId));
  };

  const handleFriendRequest = async () => {
    if (!user?.id || !targetUserId) return;
    
    try {
      await friendService.sendFriendRequest(user.id, targetUserId);
      setRequestSent(true);
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleStartChat = () => {
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(profileData) }
    });
  };

  useEffect(() => { fetchProfile(); fetchFriendStatus(); }, [targetUserId, user?.id]);

  if (!targetUserId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>User not found</Text>
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
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('../screens/SearchScreen')}
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

          {/* Tabs content */}
          {activeTab === 'Posts' && (
            <View style={{ width: '100%' }}>
              {userPosts.length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginVertical: 24 }}>No posts yet.</Text>
              ) : (
                userPosts.map(post => (
                  <View key={post.id} style={{ backgroundColor: COLORS.white, marginBottom: 16, padding: 16, borderRadius: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TouchableOpacity onPress={() => router.push({ pathname: '../screens/FriendsProfileScreen', params: { userId: post.user.id } })}>
                        <Image 
                          source={{ uri: post.user.profilePicture || DEFAULT_AVATAR }} 
                          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} 
                        />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }}>{post.user.username}</Text>
                        <Text style={{ color: COLORS.lightText, fontSize: 12 }}>{post.createdAt}</Text>
                      </View>
                    </View>
                    <Text style={{ color: COLORS.text }}>{post.content}</Text>
                    {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }} />}
                    {post.videoUrl && <Text style={{ color: COLORS.accent, marginTop: 8 }}>[Video attached]</Text>}
                    <Text style={{ color: COLORS.lightText, fontSize: 12, marginTop: 8 }}>
                      {post.likedBy?.length || 0} likes · {post.comments?.length || 0} comments
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
          {activeTab === 'Photos' && (
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
              {userPosts.filter(p => p.imageUrl).length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginVertical: 24, width: '100%' }}>No photos yet.</Text>
              ) : (
                userPosts.filter(p => p.imageUrl).map(post => (
                  <TouchableOpacity key={post.id} onPress={() => setMediaModal({ type: 'photo', uri: post.imageUrl!, postId: post.id })}>
                    <Image source={{ uri: post.imageUrl! }} style={{ width: '48%', height: 160, borderRadius: 8, marginBottom: 8 }} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
          {activeTab === 'Videos' && (
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
              {userPosts.filter(p => p.videoUrl).length + userReels.length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginVertical: 24, width: '100%' }}>No videos yet.</Text>
              ) : (
                <>
                  {userPosts.filter(p => p.videoUrl).map(post => (
                    <TouchableOpacity key={post.id} onPress={() => setMediaModal({ type: 'video', uri: post.videoUrl!, postId: post.id })}>
                      <View style={{ width: '48%', height: 160, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="videocam" size={40} color={COLORS.accent} />
                        <Text style={{ color: COLORS.text, fontSize: 13, marginTop: 8 }}>[Post Video]</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {userReels.map(reel => (
                    <TouchableOpacity key={reel.id} onPress={() => setMediaModal({ type: 'reel', uri: reel.mediaUrl, reelId: reel.id })}>
                      <View style={{ width: '48%', height: 160, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="film" size={40} color={COLORS.primary} />
                        <Text style={{ color: COLORS.text, fontSize: 13, marginTop: 8 }}>[Reel]</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
          {activeTab === 'About' && (
            <View style={{ width: '100%' }}>
              {/* User Details */}
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
                
                {profileData.details?.hometown && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="home" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>From {profileData.details.hometown}</Text>
                  </View>
                )}
                
                {profileData.details?.relationshipStatus && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="heart" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>{profileData.details.relationshipStatus}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
        {user && !isFriend && !requestSent && user.id !== targetUserId && (
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#22c55e', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={handleFriendRequest}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={handleStartChat}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        {requestSent && (
          <View style={{ backgroundColor: '#fbbf24', padding: 12, borderRadius: 8, marginVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Request Sent</Text>
          </View>
        )}
        {isFriend && (
          <TouchableOpacity
            style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginVertical: 12, alignItems: 'center' }}
            onPress={handleStartChat}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Message Friend</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Media Modal */}
      {mediaModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setMediaModal(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 24, zIndex: 2 }} onPress={() => setMediaModal(null)}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            {mediaModal.type === 'photo' && (
              <Image source={{ uri: mediaModal.uri }} style={{ width: 320, height: 320, borderRadius: 12 }} resizeMode="contain" />
            )}
            {mediaModal.type === 'video' && (
              <TouchableOpacity onPress={() => { setMediaModal(null); router.push({ pathname: '/screens/PostViewerScreen', params: { postId: mediaModal.postId } }); }}>
                <Ionicons name="play-circle" size={80} color={COLORS.accent} />
                <Text style={{ color: '#fff', marginTop: 16 }}>Tap to view video</Text>
              </TouchableOpacity>
            )}
            {mediaModal.type === 'reel' && (
              <TouchableOpacity onPress={() => { setMediaModal(null); router.push({ pathname: '/screens/ReelViewerScreen', params: { reelId: mediaModal.reelId } }); }}>
                <Ionicons name="play-circle" size={80} color={COLORS.primary} />
                <Text style={{ color: '#fff', marginTop: 16 }}>Tap to view reel</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: '#e7f0fd',
  },
  tabText: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  detailsContainer: {
    width: '100%',
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e7f0fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    color: COLORS.text,
    fontSize: 16,
  },
}); 