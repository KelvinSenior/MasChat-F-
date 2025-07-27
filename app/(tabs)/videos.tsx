import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions, AppState, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchReels, deleteReel, Reel, likeReel, unlikeReel, shareReel } from '../lib/services/reelService';
import { Video, ResizeMode } from 'expo-av';
import CommentDialog from "../components/CommentDialog";
import MenuModal from '../components/MenuModal';
import { Colors } from '../../constants/Colors';

const COLORS = {
  light: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    lightText: '#6C757D',
    border: '#E9ECEF',
    success: '#4CC9F0',
    dark: '#1A1A2E',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',     // Match marketplace dark border
    success: '#4CC9F0',
    dark: '#1A1A2E',
  },
};

const LIKE_ACTIVE_COLOR = '#FF3040';
const LIKE_INACTIVE_COLOR = Colors.light.text;
const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = Dimensions.get('window');

export default function Videos() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? COLORS.dark : COLORS.light;
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalReel, setCommentModalReel] = useState<Reel | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<{ [reelId: string]: string[] }>({});
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const reelsScrollRef = useRef<ScrollView>(null);
  const videoRefs = useRef<any[]>([]);
  const appState = useRef(AppState.currentState);
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchAllReels();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Apply mute state to current video when mute state changes
  useEffect(() => {
    const currentVideoRef = videoRefs.current[currentReelIndex];
    if (currentVideoRef && currentVideoRef.setIsMutedAsync) {
      currentVideoRef.setIsMutedAsync(muted);
    }
  }, [muted, currentReelIndex]);

  // Pause all videos when leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        pauseAllVideos();
      };
    }, [])
  );

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState !== 'active') {
      pauseAllVideos();
    }
  };

  const pauseAllVideos = () => {
    videoRefs.current.forEach(ref => {
      if (ref && ref.pauseAsync) ref.pauseAsync();
    });
  };

  const fetchAllReels = async () => {
    setLoading(true);
    try {
      const data = await fetchReels();
      setReels(data.filter(r => typeof r.id === 'string' && r.id && r.id !== 'undefined'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reelId: string) => {
    if (!user?.id) return;
    Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteReel(reelId, user.id);
        setMenuVisible(false);
        fetchAllReels();
      }},
    ]);
  };

  const handleLikeReel = async (reel: Reel) => {
    if (!user || !user.id || !(reel.id || '')) return;
    const alreadyLiked = (optimisticLikes[String(reel.id)] || reel.likedBy || []).includes(String(user.id));
    setOptimisticLikes(prev => ({
      ...prev,
      [String(reel.id)]: alreadyLiked
        ? (prev[String(reel.id)] || reel.likedBy || []).filter(id => id !== String(user.id))
        : [...(prev[String(reel.id)] || reel.likedBy || []), String(user.id)]
    }));
    try {
      if (alreadyLiked) {
        await unlikeReel(String(reel.id), String(user.id));
      } else {
        await likeReel(String(reel.id), String(user.id));
      }
      // Do not call fetchAllReels here to avoid resetting the scroll position
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleShare = async (reelId: string) => {
    await shareReel(reelId || '');
    fetchAllReels();
  };

  // Helper to share reel media
  const handleShareMedia = async (reel: Reel) => {
    try {
      const r = reel as Reel & { videoUrl?: string; imageUrl?: string };
      const url = r.videoUrl || r.imageUrl || r.mediaUrl;
      if (!url) {
        Alert.alert('Nothing to share', 'No media found in this reel.');
        return;
      }
      await Share.share({
        message: url,
        url: url,
        title: 'Check out this reel on MasChat!'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share media.');
    }
  };

  const handleReelScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / DEVICE_HEIGHT);
    setCurrentReelIndex(newIndex);
    setPaused(false); // auto-play on scroll
    videoRefs.current.forEach((ref, idx) => {
      if (ref && ref.pauseAsync && idx !== newIndex) ref.pauseAsync();
      if (ref && ref.playAsync && idx === newIndex) ref.playAsync();
    });
    // Apply mute state to the new video
    const newVideoRef = videoRefs.current[newIndex];
    if (newVideoRef && newVideoRef.setIsMutedAsync) {
      newVideoRef.setIsMutedAsync(muted);
    }
  };

  const handleVideoPress = (index: number) => {
    setPaused((prev) => {
      const newPaused = !prev;
      const ref = videoRefs.current[index];
      if (ref) {
        if (newPaused) ref.pauseAsync();
        else ref.playAsync();
      }
      return newPaused;
    });
  };

  const handleMuteToggle = () => {
    setMuted((prev) => {
      const newMuted = !prev;
      // Update the current video's mute state
      const ref = videoRefs.current[currentReelIndex];
      if (ref && ref.setIsMutedAsync) {
        ref.setIsMutedAsync(newMuted);
      }
      return newMuted;
    });
  };

  const handleSpeedChange = (speed: number) => {
    setVideoSpeed(speed);
    const ref = videoRefs.current[currentReelIndex];
    if (ref) ref.setRateAsync(speed, false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const currentReel = reels[currentReelIndex] || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.reelsTitle}>Reels</Text>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.light.accent} />
      ) : reels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={60} color="#fff" />
          <Text style={styles.emptyText}>No reels yet.</Text>
          <TouchableOpacity 
            style={styles.createBtn} 
            onPress={() => router.push('/(create)/newReel')}
          >
            <LinearGradient
              colors={['#FF7F11', '#FF3040']}
              style={styles.gradientBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.createBtnText}>Create New Reel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={reelsScrollRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleReelScroll}
          scrollEventThrottle={16}
        >
          {reels.map((reel, index) => (
            <View key={reel.id} style={[styles.reelItem, { height: DEVICE_HEIGHT }]}> 
              {/* Video/Image Content */}
              <TouchableOpacity
                activeOpacity={1}
                style={styles.mediaContainer}
                onPress={() => handleVideoPress(index)}
              >
                {(reel as any).videoUrl ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {videoLoading[index] && (
                      <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }} />
                    )}
                    <Video
                      ref={ref => { videoRefs.current[index] = ref; return undefined; }}
                      source={{ uri: (reel as any).videoUrl }}
                      style={styles.fullVideo}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={index === currentReelIndex && !paused}
                      isLooping
                      useNativeControls={false}
                      isMuted={muted}
                      rate={videoSpeed}
                      onLoadStart={() => setVideoLoading(v => ({ ...v, [index]: true }))}
                      onReadyForDisplay={() => setVideoLoading(v => ({ ...v, [index]: false }))}
                      onError={error => {
                        setVideoLoading(v => ({ ...v, [index]: false }));
                        // Silently handle video errors - they're common and not critical
                        // Alert.alert('Video Error', 'This video cannot be played. Please try another reel.');
                        // console.error('Reel video error:', error);
                      }}
                    />
                  </View>
                ) : (reel as any).imageUrl ? (
                  <Image source={{ uri: (reel as any).imageUrl }} style={styles.fullImage} resizeMode="cover" />
                ) : null}
                {/* Mute/Unmute Button */}
                {(reel as any).videoUrl && (
                  <TouchableOpacity style={styles.muteBtn} onPress={handleMuteToggle}>
                    <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={28} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Bottom Info Section */}
              <View style={styles.bottomInfo}>
                <View style={styles.userInfo}>
                  <Image 
                    source={{ uri: reel.profilePicture || 'https://i.pravatar.cc/150?img=3' }} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.username}>@{reel.username}</Text>
                  <TouchableOpacity 
                    style={styles.followBtn}
                    onPress={() => {}}
                  >
                    <Text style={styles.followText}>Follow</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.caption}>{reel.caption}</Text>
                <View style={styles.soundInfo}>
                  <MaterialIcons name="music-note" size={14} color="#fff" />
                  <Text style={styles.soundText}>Original Sound</Text>
                </View>
              </View>

              {/* Right Action Buttons */}
              <View style={styles.rightActions}>
                {/* Like Button */}
                <TouchableOpacity 
                  onPress={() => handleLikeReel(reel)} 
                  style={styles.actionButton}
                >
                  <Ionicons 
                    name={(optimisticLikes[reel.id] || reel.likedBy || []).includes(String(user?.id)) ? "heart" : "heart-outline"} 
                    size={38} 
                    color={(optimisticLikes[reel.id] || reel.likedBy || []).includes(String(user?.id)) ? '#FF3040' : '#fff'}
                  />
                  <Text style={styles.actionCount}>
                    {formatNumber((optimisticLikes[reel.id] || reel.likedBy || []).length)}
                  </Text>
                </TouchableOpacity>

                {/* Comment Button */}
                <TouchableOpacity 
                  onPress={() => setCommentModalReel(reel)} 
                  style={styles.actionButton}
                >
                  <Ionicons name="chatbubble-outline" size={34} color="#fff" />
                  <Text style={[styles.actionCount, { color: '#fff' }]}>{reel.comments ? reel.comments.length : 0}</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity 
                  onPress={() => handleShareMedia(reel)} 
                  style={styles.actionButton}
                >
                  <Feather name="send" size={32} color="#fff" />
                  <Text style={styles.actionCount}>{formatNumber((reel as any).shareCount || 0)}</Text>
                </TouchableOpacity>

                {/* More Options (Menu) */}
                {user?.id === reel.userId && (
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedReel(reel);
                      setMenuVisible(true);
                    }} 
                    style={styles.actionButton}
                  >
                    <FontAwesome name="ellipsis-v" size={28} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Comment Modal */}
      {commentModalReel && user?.id && (
        <CommentDialog
          postId={commentModalReel.id}
          userId={user.id}
          onClose={() => setCommentModalReel(null)}
          onComment={fetchAllReels}
        />
      )}

      {/* Menu Modal */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[
          {
            label: 'Delete Reel',
            icon: 'trash-outline',
            color: 'red',
            onPress: () => selectedReel && handleDelete(selectedReel.id)
          },
          {
            label: 'Create New Reel',
            icon: 'add-circle-outline',
            onPress: () => router.push('/(create)/newReel')
          },
          { type: 'select', label: '0.5x', icon: 'speedometer-outline', selected: videoSpeed === 0.5, onPress: () => handleSpeedChange(0.5) },
          { type: 'select', label: '1x', icon: 'speedometer-outline', selected: videoSpeed === 1, onPress: () => handleSpeedChange(1) },
          { type: 'select', label: '1.5x', icon: 'speedometer-outline', selected: videoSpeed === 1.5, onPress: () => handleSpeedChange(1.5) },
          { type: 'select', label: '2x', icon: 'speedometer-outline', selected: videoSpeed === 2, onPress: () => handleSpeedChange(2) },
          {
            label: 'Cancel',
            icon: 'close',
            onPress: () => setMenuVisible(false)
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  reelsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 1,
  },
  profileBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: Colors.light.text,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: Colors.light.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reelItem: {
    flex: 1,
    width: DEVICE_WIDTH,
    backgroundColor: Colors.light.background,
    position: 'relative',
  },
  mediaContainer: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  muteBtn: {
    position: 'absolute',
    right: 15,
    bottom:95, // moved even higher for extra clearance
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 20,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 100,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  followBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  followText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 160, // moved even higher so mute button is not hidden behind tabs
    alignItems: 'center',
    gap: 28,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: '#fff',
    fontSize: 16,
    marginTop: 6,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});