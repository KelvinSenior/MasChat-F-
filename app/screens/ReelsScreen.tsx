import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video, ResizeMode } from 'expo-av';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const reelsData = [
  {
    id: 1,
    user: "RM002",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4",
    caption: "Part63 #dance #viral",
    likes: "444K",
    comments: "2.6K",
    shares: "1.7K",
  },
  {
    id: 2,
    user: "Sølø Bøíí",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    caption: "Nature is beautiful 🌿 #nature #travel",
    likes: "120K",
    comments: "1.2K",
    shares: "800",
  },
];

export default function ReelsScreen() {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = Dimensions.get('window').height;
    const newIndex = Math.round(offsetY / height);
    if (newIndex >= 0 && newIndex < reelsData.length) {
      setCurrentReelIndex(newIndex);
    }
  };

  return (
    <View style={styles.reelsContainer}>
      {reelsData.length > 0 ? (
        <ScrollView
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {reelsData.map((reel, index) => (
            <View key={reel.id} style={styles.reelItem}>
              {/* Video Player */}
              <Video
                source={{ uri: reel.videoUrl }}
                style={styles.reelVideo}
                resizeMode={ResizeMode.COVER}
                shouldPlay={index === currentReelIndex}
                isLooping
                useNativeControls={false}
              />
              
              {/* Reel Info */}
              <View style={styles.reelInfoContainer}>
                <View style={styles.reelUserInfo}>
                  <Image source={{ uri: reel.avatar }} style={styles.reelAvatar} />
                  <Text style={styles.reelUsername}>{reel.user}</Text>
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
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart" size={30} color="white" />
                  <Text style={styles.actionCount}>{reel.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push(`/screens/ChatScreen?reelId=${reel.id}`)}
                >
                  <Ionicons name="chatbubble" size={30} color="white" />
                  <Text style={styles.actionCount}>{reel.comments}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="send" size={30} color="white" />
                  <Text style={styles.actionCount}>{reel.shares}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="ellipsis-horizontal" size={30} color="white" />
                </TouchableOpacity>
                
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
          <TouchableOpacity 
            style={styles.createReelButtonLarge}
            onPress={() => router.push("/(create)/newReel")}
          >
            <LinearGradient
              colors={[COLORS.accent, '#FF9E40']}
              style={styles.createReelGradientLarge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.createReelText}>Create Your First Reel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reelsContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  reelItem: {
    width: '100%',
    height: Dimensions.get('window').height,
    position: 'relative',
  },
  reelVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  reelInfoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 100,
  },
  reelUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  reelUsername: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 12,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  followButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reelCaption: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 12,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundName: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
  },
  rightActionBar: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: 24,
    alignItems: 'center',
  },
  actionCount: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 4,
  },
  createReelButton: {
    backgroundColor: COLORS.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  createReelGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyReels: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyReelsText: {
    color: COLORS.lightText,
    fontSize: 18,
    marginTop: 16,
  },
  createReelButtonLarge: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createReelGradientLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createReelText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 