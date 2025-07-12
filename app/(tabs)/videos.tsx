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

const TABS = ["For you", "Live", "Reels", "Following"];

const videoFeed = [
  {
    id: 1,
    user: "RM002",
    date: "Nov 28, 2024",
    desc: "Part63",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    videoThumb:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
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
    videoThumb:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
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

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Video</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => router.push("/profile")}
            style={styles.iconBtn}
          >
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.iconBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => router.push('../screens/SearchScreen')}
          >
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

      {/* Tabs */}
      <LinearGradient
        colors={['#fff', '#f8f9fa']}
        style={styles.tabsContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
      </LinearGradient>

      {/* Video Feed */}
      <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
        {videoFeed.map((item) => (
          <View style={styles.feed} key={item.id}>
            <View style={styles.feedHeader}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.feedAvatarContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image source={{ uri: item.avatar }} style={styles.feedAvatar} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedName}>{item.user} <Text style={styles.follow}>· Follow</Text></Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.feedTime}>{item.date}</Text>
                  <Feather name="globe" size={12} color="#888" style={{ marginLeft: 4 }} />
                </View>
              </View>
              <Feather name="more-horizontal" size={20} color="#888" style={{ marginRight: 8 }} />
              <Ionicons name="close" size={20} color="#888" />
            </View>
            <Text style={styles.feedDesc}>{item.desc}</Text>
            <Image source={{ uri: item.videoThumb }} style={[styles.feedVideo, { width: width - 24 }]} />
            <View style={styles.statsRow}>
              <View style={styles.statsLeft}>
                <FontAwesome name="thumbs-up" size={16} color="#1877f2" />
                <Text style={styles.statsText}>{item.likes}</Text>
              </View>
              <Text style={styles.statsText}>{item.comments} comments</Text>
              <Text style={styles.statsText}>{item.shares} shares</Text>
              <Text style={styles.statsText}>{item.views} views</Text>
            </View>
            <View style={styles.feedActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <LinearGradient 
                  colors={['#4facfe', '#00f2fe']} 
                  style={styles.actionIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome name="thumbs-up" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <LinearGradient 
                  colors={['#667eea', '#764ba2']} 
                  style={styles.actionIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="chatbubble" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <LinearGradient 
                  colors={['#f093fb', '#f5576c']} 
                  style={styles.actionIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.actionText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <LinearGradient 
                  colors={['#43e97b', '#38f9d7']} 
                  style={styles.actionIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="arrow-redo" size={16} color="white" />
                </LinearGradient>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 24,
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
    marginLeft: 10,
  },
  iconBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsRow: {
    paddingHorizontal: 12,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: "#e7f0fd",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    fontFamily: 'sans-serif-medium'
  },
  tabTextActive: {
    color: "#1877f2",
    fontWeight: "bold",
  },
  feedScroll: {
    flex: 1,
  },
  feed: {
    backgroundColor: "#fff",
    borderRadius: 16,
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
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white'
  },
  feedName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    fontFamily: 'sans-serif-medium'
  },
  follow: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 14,
  },
  feedTime: {
    color: "#888",
    fontSize: 13,
    fontFamily: 'sans-serif'
  },
  feedDesc: {
    fontSize: 15,
    color: "#222",
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: 'sans-serif'
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
    color: "#666",
    fontSize: 14,
    marginLeft: 6,
    fontFamily: 'sans-serif'
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
  actionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6
  },
  actionText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
    fontFamily: 'sans-serif-medium'
  },
});