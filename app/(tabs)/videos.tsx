import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import ReelsScreen from '../screens/ReelsScreen';
import { useAuth } from '../context/AuthContext';
import { fetchReels, Reel, deleteReel } from '../lib/services/reelService';
// TODO: Replace with expo-video when available in SDK 54
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { getPosts, Post, deletePost } from '../lib/services/postService';
import { fetchStories, Story, deleteStory } from '../lib/services/storyService';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const TABS = ["For you", "Live", "Reels", "Posts", "Stories", "Following"];

const videoFeed = [
  {
    id: 1,
    user: "RM002",
    date: "Nov 28, 2024",
    desc: "Part63",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    videoThumb: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4",
    likes: "444K",
    comments: "2.6K",
    shares: "1.7K",
    views: "51.4M",
  },
  {
    id: 2,
    user: "Sølø Bøíí",
    date: "Dec 4, 2024",
    desc: "Every child's favorite scene 😂",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    videoThumb: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    likes: "120K",
    comments: "1.2K",
    shares: "800",
    views: "10.2M",
  },
];



export default function Videos() {
  const [activeTab, setActiveTab] = useState("For you");
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reels, setReels] = useState<Reel[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const reelsScrollRef = useRef<ScrollView>(null);
  const postsScrollRef = useRef<ScrollView>(null);
  const storiesScrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const initialReelId = typeof params.reelId === 'string' ? params.reelId : undefined;
  const initialPostId = typeof params.postId === 'string' ? params.postId : undefined;
  const initialStoryId = typeof params.storyId === 'string' ? params.storyId : undefined;
  const initialTab = typeof params.tab === 'string' ? params.tab : undefined;
  const { width } = Dimensions.get("window");

  React.useEffect(() => {
    if (initialTab && TABS.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    if (activeTab === "Reels") {
      setLoadingReels(true);
      fetchReels()
        .then(data => setReels(data))
        .catch(() => setReels([]))
        .finally(() => setLoadingReels(false));
    } else if (activeTab === "Posts") {
      setLoadingPosts(true);
      getPosts()
        .then(data => setPosts(data))
        .catch(() => setPosts([]))
        .finally(() => setLoadingPosts(false));
    } else if (activeTab === "Stories") {
      setLoadingStories(true);
      fetchStories()
        .then(data => setStories(data))
        .catch(() => setStories([]))
        .finally(() => setLoadingStories(false));
    }
  }, [activeTab]);

  // Scroll to correct reel/post/story if id is provided
  React.useEffect(() => {
    if (activeTab === "Reels" && reels.length > 0 && initialReelId) {
      const index = reels.findIndex(r => r.id === initialReelId);
      if (index !== -1) {
        setCurrentReelIndex(index);
        setTimeout(() => {
          reelsScrollRef.current?.scrollTo({ y: index * Dimensions.get('window').height, animated: false });
        }, 100);
      }
    } else if (activeTab === "Posts" && posts.length > 0 && initialPostId) {
      const index = posts.findIndex(p => p.id === initialPostId);
      if (index !== -1) {
        setCurrentPostIndex(index);
        setTimeout(() => {
          postsScrollRef.current?.scrollTo({ y: index * Dimensions.get('window').height, animated: false });
        }, 100);
      }
    } else if (activeTab === "Stories" && stories.length > 0 && initialStoryId) {
      const index = stories.findIndex(s => s.id === initialStoryId);
      if (index !== -1) {
        setCurrentStoryIndex(index);
        setTimeout(() => {
          storiesScrollRef.current?.scrollTo({ y: index * Dimensions.get('window').height, animated: false });
        }, 100);
      }
    }
  }, [activeTab, reels, posts, stories, initialReelId, initialPostId, initialStoryId]);

  // Add cleanup effect for videos when leaving reels tab
  React.useEffect(() => {
    return () => {
      // Cleanup videos when component unmounts or tab changes
      if (activeTab !== "Reels") {
        setCurrentReelIndex(0);
      }
    };
  }, [activeTab]);

  // Stop reels when leaving reels tab
  React.useEffect(() => {
    if (activeTab !== "Reels") {
      setCurrentReelIndex(-1); // Set to -1 to stop all videos
    }
  }, [activeTab]);

  const handleReelScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = Dimensions.get('window').height;
    const newIndex = Math.round(offsetY / height);
    setCurrentReelIndex(newIndex);
  };
  const handlePostScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = Dimensions.get('window').height;
    const newIndex = Math.round(offsetY / height);
    setCurrentPostIndex(newIndex);
  };
  const handleStoryScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = Dimensions.get('window').height;
    const newIndex = Math.round(offsetY / height);
    setCurrentStoryIndex(newIndex);
  };

  const handleDeleteReel = async (reelId: string) => {
    if (!user?.id) return;
    Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteReel(reelId, user.id);
          setReels(prev => prev.filter(reel => reel.id !== reelId));
          Alert.alert('Success', 'Reel deleted successfully');
        } catch (error) {
          console.error('Error deleting reel:', error);
          Alert.alert('Error', 'Failed to delete reel');
        }
      }},
    ]);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deletePost(postId, user.id);
          setPosts(prev => prev.filter(post => post.id !== postId));
          Alert.alert('Success', 'Post deleted successfully');
        } catch (error) {
          console.error('Error deleting post:', error);
          Alert.alert('Error', 'Failed to delete post');
        }
      }},
    ]);
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!user?.id) return;
    Alert.alert('Delete Story', 'Are you sure you want to delete this story?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteStory(storyId, user.id);
          setStories(prev => prev.filter(story => story.id !== storyId));
          Alert.alert('Success', 'Story deleted successfully');
        } catch (error) {
          console.error('Error deleting story:', error);
          Alert.alert('Error', 'Failed to delete story');
        }
      }},
    ]);
  };

  // --- Render vertical scroll for each tab ---
  if (activeTab === "Reels") {
    return (
      <View style={styles.reelsContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        {loadingReels ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Loading reels...</Text>
          </View>
        ) : reels.length > 0 ? (
          <ScrollView
            ref={reelsScrollRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onScroll={handleReelScroll}
            scrollEventThrottle={16}
          >
            {reels.map((reel, index) => (
              <View key={reel.id} style={styles.reelItem}>
                <Video
                  source={{ uri: reel.mediaUrl }}
                  style={styles.reelVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={index === currentReelIndex && currentReelIndex >= 0}
                  isLooping
                  isMuted={false}
                  useNativeControls={false}
                  onLoad={() => {
                    console.log('Video loaded:', reel.mediaUrl);
                  }}
                  onError={(error) => {
                    console.error('Video error:', error);
                    // Try to reload video on error
                    if (index === currentReelIndex) {
                      setTimeout(() => {
                        setCurrentReelIndex(currentReelIndex);
                      }, 1000);
                    }
                  }}
                  onLoadStart={() => {
                    console.log('Video loading started:', reel.mediaUrl);
                  }}
                />
                {/* Reel Info and Action Bar ... (reuse your existing code) */}
                <View style={styles.reelInfoContainer}>
                  <View style={styles.reelUserInfo}>
                    <Image source={{ uri: reel.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.reelAvatar} />
                    <Text style={styles.reelUsername}>{reel.username}</Text>
                    <TouchableOpacity style={styles.followButton}>
                      <Text style={styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reelCaption}>{reel.caption}</Text>
                  {/* Sound Info */}
                  <View style={styles.soundInfo}>
                    <Ionicons name="musical-notes" size={16} color="white" />
                    <Text style={styles.soundName}>Original Sound</Text>
                  </View>
                </View>
                {/* Right Action Bar */}
                <View style={styles.rightActionBar}>
                  <View style={styles.actionBarButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="heart" size={32} color="white" />
                      <Text style={styles.actionCount}>{reel.likedBy?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="chatbubble" size={32} color="white" />
                      <Text style={styles.actionCount}>{reel.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="send" size={32} color="white" />
                      <Text style={styles.actionCount}>{reel.shareCount || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="ellipsis-horizontal" size={32} color="white" />
                    </TouchableOpacity>
                    {user?.id === reel.userId && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteReel(reel.id)}
                      >
                        <Ionicons name="trash" size={32} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.createReelButton}
                    onPress={() => router.push("/(create)/newReel")}
                  >
                    <LinearGradient
                      colors={[COLORS.accent, '#FF9E40']}
                      style={styles.createReelGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="add" size={24} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyReels}>
            <Ionicons name="videocam-off" size={60} color={COLORS.lightText} />
            <Text style={styles.emptyReelsText}>No reels yet</Text>
          </View>
        )}
        
        {/* Main Videos Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => setActiveTab('For you')}
        >
          <Ionicons name="grid" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
  if (activeTab === "Posts") {
    return (
      <View style={styles.reelsContainer}>
        {/* Header with back to main Videos tab */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        {/* Main Videos Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => setActiveTab('For you')}
        >
          <Ionicons name="grid" size={28} color="#fff" />
        </TouchableOpacity>
        
        {loadingPosts ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Loading posts...</Text>
          </View>
        ) : posts.length > 0 ? (
          <ScrollView
            ref={postsScrollRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onScroll={handlePostScroll}
            scrollEventThrottle={16}
          >
            {posts.map((post, index) => (
              <View key={post.id} style={styles.reelItem}>
                <View style={styles.postMediaContainer}>
                  {post.videoUrl ? (
                    <Video 
                      source={{ uri: post.videoUrl }} 
                      style={styles.postMedia} 
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={index === currentPostIndex} 
                      isLooping 
                      isMuted={false}
                      useNativeControls={false}
                      onError={(error) => {
                        console.error('Post video error:', error);
                      }}
                    />
                  ) : post.imageUrl ? (
                    <Image source={{ uri: post.imageUrl }} style={styles.postMedia} resizeMode="contain" />
                  ) : null}
                </View>
                
                {/* Post Info */}
                <View style={styles.postInfoContainer}>
                  <View style={styles.postUserInfo}>
                    <Image source={{ uri: post.user.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.reelAvatar} />
                    <Text style={styles.reelUsername}>{post.user.username}</Text>
                    <TouchableOpacity style={styles.followButton}>
                      <Text style={styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reelCaption}>{post.content}</Text>
                </View>
                
                {/* Action Counts Beneath Media */}
                <View style={styles.postActionCounts}>
                  <View style={styles.actionCountItem}>
                    <Ionicons name="heart" size={20} color="white" />
                    <Text style={styles.actionCountText}>{post.likedBy?.length || 0}</Text>
                  </View>
                  <View style={styles.actionCountItem}>
                    <Ionicons name="chatbubble" size={20} color="white" />
                    <Text style={styles.actionCountText}>{post.comments?.length || 0}</Text>
                  </View>
                  <View style={styles.actionCountItem}>
                    <Ionicons name="send" size={20} color="white" />
                    <Text style={styles.actionCountText}>{post.shareCount || 0}</Text>
                  </View>
                  {user?.id === post.user.id && (
                    <TouchableOpacity 
                      style={styles.actionCountItem}
                      onPress={() => handleDeletePost(post.id)}
                    >
                      <Ionicons name="trash" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyReels}>
            <Ionicons name="image-outline" size={60} color={COLORS.lightText} />
            <Text style={styles.emptyReelsText}>No posts yet</Text>
          </View>
        )}
      </View>
    );
  }
  if (activeTab === "Stories") {
    return (
      <View style={styles.reelsContainer}>
        {/* Header with back to main Videos tab */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        {/* Main Videos Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => setActiveTab('For you')}
        >
          <Ionicons name="grid" size={28} color="#fff" />
        </TouchableOpacity>
        
        {loadingStories ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Loading stories...</Text>
          </View>
        ) : stories.length > 0 ? (
          <ScrollView
            ref={storiesScrollRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onScroll={handleStoryScroll}
            scrollEventThrottle={16}
          >
            {stories.map((story, index) => (
              <View key={story.id} style={styles.reelItem}>
                <View style={styles.postMediaContainer}>
                  <Image source={{ uri: story.mediaUrl || 'https://via.placeholder.com/150' }} style={styles.postMedia} resizeMode="contain" />
                </View>
                
                {/* Story Info */}
                <View style={styles.postInfoContainer}>
                  <View style={styles.postUserInfo}>
                    <Image source={{ uri: story.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.reelAvatar} />
                    <Text style={styles.reelUsername}>{story.username || 'Anonymous'}</Text>
                    <TouchableOpacity style={styles.followButton}>
                      <Text style={styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reelCaption}>{story.caption || 'No caption'}</Text>
                </View>
                
                {/* Action Counts Beneath Media */}
                <View style={styles.postActionCounts}>
                  <View style={styles.actionCountItem}>
                    <Ionicons name="heart" size={20} color="white" />
                    <Text style={styles.actionCountText}>0</Text>
                  </View>
                  <View style={styles.actionCountItem}>
                    <Ionicons name="chatbubble" size={20} color="white" />
                    <Text style={styles.actionCountText}>0</Text>
                  </View>
                  <View style={styles.actionCountItem}>
                    <Ionicons name="send" size={20} color="white" />
                    <Text style={styles.actionCountText}>0</Text>
                  </View>
                  {user?.id === story.userId && (
                    <TouchableOpacity 
                      style={styles.actionCountItem}
                      onPress={() => handleDeleteStory(story.id)}
                    >
                      <Ionicons name="trash" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyReels}>
            <Ionicons name="image-outline" size={60} color={COLORS.lightText} />
            <Text style={styles.emptyReelsText}>No stories yet</Text>
          </View>
        )}
      </View>
    );
  }

  // --- Main Video Screen (default) ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.logo}>
          Mas<Text style={{ color: COLORS.accent }}>Chat</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => router.push('../screens/SearchScreen')}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Video Feed */}
      <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
        {videoFeed.map((item) => (
          <View style={styles.feed} key={item.id}>
            <View style={styles.feedHeader}>
              <View style={styles.feedAvatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.feedAvatar} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedName}>{item.user} <Text style={styles.follow}>· Follow</Text></Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.feedTime}>{item.date}</Text>
                  <Feather name="globe" size={12} color={COLORS.lightText} style={{ marginLeft: 4 }} />
                </View>
              </View>
              <Feather name="more-horizontal" size={20} color={COLORS.lightText} style={{ marginRight: 8 }} />
              <Ionicons name="close" size={20} color={COLORS.lightText} />
            </View>
            <Text style={styles.feedDesc}>{item.desc}</Text>
            <Image source={{ uri: item.videoThumb }} style={[styles.feedVideo, { width: width - 24 }]} />
            <View style={styles.statsRow}>
              <View style={styles.statsLeft}>
                <FontAwesome name="thumbs-up" size={16} color={COLORS.primary} />
                <Text style={styles.statsText}>{item.likes}</Text>
              </View>
              <Text style={styles.statsText}>{item.comments} comments</Text>
              <Text style={styles.statsText}>{item.shares} shares</Text>
              <Text style={styles.statsText}>{item.views} views</Text>
            </View>
            <View style={styles.feedActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionIcon}>
                  <FontAwesome name="thumbs-up" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionIcon}>
                  <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionIcon}>
                  <Ionicons name="send" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionIcon}>
                  <Ionicons name="arrow-redo" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ReelsScreenWithButton() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  // No need to fetch reels here, ReelsScreen does it

  return (
    <View style={{ flex: 1 }}>
      <ReelsScreen />
      <TouchableOpacity onPress={() => router.push('/screens/ReelsScreen')} style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#FF7F11', padding: 10, borderRadius: 20, zIndex: 10 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Reels Tab</Text>
      </TouchableOpacity>
    </View>
  );
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  tabBtnActive: {
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
  feedScroll: {
    flex: 1,
  },
  feed: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  feedAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f0f2f5',
    overflow: 'hidden',
  },
  feedAvatar: {
    width: '100%',
    height: '100%',
  },
  feedName: {
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.text,
  },
  follow: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  feedTime: {
    color: COLORS.lightText,
    fontSize: 13,
  },
  feedDesc: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  feedVideo: {
    height: 240,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 12,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statsText: {
    color: COLORS.lightText,
    fontSize: 14,
    marginLeft: 6,
  },
  feedActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e4e6eb",
    paddingTop: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: '#f0f2f5',
  },
  actionText: {
    color: COLORS.lightText,
    fontWeight: "500",
    fontSize: 14,
  },
  reelsContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  reelItem: {
    width: '100%',
    height: Dimensions.get('window').height,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelVideo: {
    width: '100%',
    maxHeight: 400,
    alignSelf: 'center',
    backgroundColor: '#000',
    borderRadius: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  reelInfoContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 10,
  },
  reelUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reelAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  reelUsername: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  followButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  followButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reelCaption: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 5,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundName: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 5,
  },
  rightActionBar: {
    position: 'absolute',
    right: 16,
    top: '45%',
    alignItems: 'center',
    zIndex: 10,
  },
  actionBarButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 18,
  },
  actionCount: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  createReelButton: {
    position: 'absolute',
    bottom: -10,
    right: -7,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    shadowColor: '#FF7F11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  createReelGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createReelButtonLarge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '80%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    shadowColor: '#FF7F11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  createReelGradientLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createReelText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyReels: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyReelsText: {
    color: COLORS.lightText,
    fontSize: 18,
    marginTop: 10,
  },
  postMediaContainer: {
    width: '100%',
    height: '100%', // Full screen height
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  postMedia: {
    width: '100%',
    height: '100%', // Full screen height
  },
  postInfoContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 10,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  postActionCounts: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 10,
  },
  actionCountItem: {
    alignItems: 'center',
  },
  actionCountText: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
});