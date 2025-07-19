import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
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

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const TABS = ["For you", "Live", "Reels", "Following"];

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
  const router = useRouter();
  const { width } = Dimensions.get("window");

  if (activeTab === "Reels") {
    router.push("/screens/ReelsScreen");
    return null;
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
        <Text style={styles.logo}>
          Mas<Text style={{ color: COLORS.accent }}>Chat</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => router.push("/profile")}
            style={styles.iconBtn}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
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
});