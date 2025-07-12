import { Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CommentDialog from "../components/CommentDialog";
import { useAuth } from '../context/AuthContext';
import { getPosts, likePost, unlikePost } from "../lib/services/postService";

const stories = [
  {
    id: "create",
    isCreate: true,
    icon: "add-circle",
    label: "Create Story",
  },
  {
    id: "1",
    isCreate: false,
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    label: "John",
    online: true,
  },
  {
    id: "2",
    isCreate: false,
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    label: "Jane",
    online: false,
  },
  {
    id: "3",
    isCreate: false,
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    label: "Mike",
    online: true,
  },
  {
    id: "4",
    isCreate: false,
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    label: "Anna",
    online: false,
  },
];

const DEFAULT_PROFILE_PHOTO = "https://i.imgur.com/6XbK6bE.jpg";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [posts, setPosts] = useState([]);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const data = await getPosts();
    setPosts(data.reverse());
  };

  const handleLike = async (postId: number) => {
    if (!user) return;
    await likePost(postId, user.id);
    fetchPosts();
  };

  const handleUnlike = async (postId: number) => {
    if (!user) return;
    await unlikePost(postId, user.id);
    fetchPosts();
  };

  if (!user) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>User not found</Text></View>;
  }

  return (
    <LinearGradient 
      colors={['#f5f7fa', '#e4e8f0']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.logo}>
          Mas
          <Text style={styles.logoChat}>Chat</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowAddMenu(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('../screens/SearchScreen')}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("../screens/MessengerScreen")}>
            <Ionicons name="chatbubble-ellipses" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Add Menu Modal */}
      <Modal
        visible={showAddMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowAddMenu(false)}
        >
          <LinearGradient 
            colors={['#fff', '#f5f7fa']} 
            style={styles.addMenuBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newPost");
              }}
            >
              <LinearGradient 
                colors={['#4facfe', '#00f2fe']} 
                style={styles.menuIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="create-outline" size={22} color="white" />
              </LinearGradient>
              <Text style={styles.addMenuText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newStory");
              }}
            >
              <LinearGradient 
                colors={['#667eea', '#764ba2']} 
                style={styles.menuIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="images-outline" size={22} color="white" />
              </LinearGradient>
              <Text style={styles.addMenuText}>Story</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newReel");
              }}
            >
              <LinearGradient 
                colors={['#f093fb', '#f5576c']} 
                style={styles.menuIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="film-outline" size={22} color="white" />
              </LinearGradient>
              <Text style={styles.addMenuText}>Reel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/LiveScreen");
              }}
            >
              <LinearGradient 
                colors={['#43e97b', '#38f9d7']} 
                style={styles.menuIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="videocam-outline" size={22} color="white" />
              </LinearGradient>
              <Text style={styles.addMenuText}>Live</Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* What's on your mind */}
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={styles.statusContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <Image
              source={{ uri: user?.profilePicture ?? DEFAULT_PROFILE_PHOTO }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.statusInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => router.push("/(create)/newPost")}>
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.photoBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="photo-library" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.storiesRow}
          contentContainerStyle={styles.storiesContent}
        >
          {stories.map((story) =>
            story.isCreate ? (
              <TouchableOpacity 
                key={story.id} 
                style={styles.storyItem}
                onPress={() => router.push("/(create)/newStory")}
              >
                <LinearGradient
                  colors={['#a18cd1', '#fbc2eb']}
                  style={styles.createStoryCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={story.icon as any} size={36} color="white" />
                </LinearGradient>
                <Text style={styles.storyLabel}>{story.label}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity key={story.id} style={styles.storyItem}>
                <LinearGradient
                  colors={['#ff9a9e', '#fad0c4']}
                  style={styles.storyImageContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  {story.online && <View style={styles.onlineDot} />}
                </LinearGradient>
                <Text style={styles.storyLabel}>{story.label}</Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Feed */}
        <View style={styles.feed}>
          <View style={styles.feedHeader}>
            <View style={styles.feedAvatarContainer}>
              <Image
                source={{ uri: user?.profilePicture ?? DEFAULT_PROFILE_PHOTO }}
                style={styles.feedAvatar}
              />
            </View>
            <View>
              <Text style={styles.feedName}>{user?.fullName ?? 'User'}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.feedTime}>1d</Text>
                <Feather name="globe" size={12} color="#888" style={{ marginLeft: 4 }} />
              </View>
            </View>
            <Feather name="more-horizontal" size={20} color="#888" style={{ marginLeft: "auto" }} />
          </View>
          <Text style={styles.feedText}>Check out this awesome place! The sunset views here are absolutely breathtaking and worth the hike.</Text>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.feedImage}
          />
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
                <Ionicons name="arrow-redo" size={16} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional sample post */}
        <View style={styles.feed}>
          <View style={styles.feedHeader}>
            <View style={styles.feedAvatarContainer}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                style={styles.feedAvatar}
              />
            </View>
            <View>
              <Text style={styles.feedName}>Sarah Johnson</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.feedTime}>3h</Text>
                <Feather name="globe" size={12} color="#888" style={{ marginLeft: 4 }} />
              </View>
            </View>
            <Feather name="more-horizontal" size={20} color="#888" style={{ marginLeft: "auto" }} />
          </View>
          <Text style={styles.feedText}>Just finished this amazing book! Highly recommend to anyone interested in personal development.</Text>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.feedImage}
          />
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
                <Ionicons name="arrow-redo" size={16} color="white" />
              </LinearGradient>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {commentPostId && (
        <CommentDialog
          postId={commentPostId}
          userId={user.id}
          onClose={() => setCommentPostId(null)}
          onComment={fetchPosts}
        />
      )}
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
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "sans-serif",
    letterSpacing: 1,
    flex: 1,
    color: "white",
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  logoChat: {
    color: "#ffd700",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 6,
    marginLeft: 10,
  },
  scroll: {
    flex: 1,
    paddingTop: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#1877f2'
  },
  statusInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 10,
    color: "#222",
    height: 40,
    fontFamily: 'sans-serif-medium'
  },
  photoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  storiesRow: {
    paddingVertical: 12,
    paddingLeft: 12,
    marginBottom: 12,
  },
  storiesContent: {
    paddingRight: 12
  },
  storyItem: {
    alignItems: "center",
    marginRight: 12,
    width: 80
  },
  storyImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "white",
  },
  createStoryCircle: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  storyLabel: {
    fontSize: 12,
    color: "#222",
    textAlign: "center",
    marginTop: 2,
    fontFamily: 'sans-serif-medium'
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4cd137",
    borderWidth: 2,
    borderColor: "#fff",
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
    marginRight: 10,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  feedName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    fontFamily: 'sans-serif-medium'
  },
  feedTime: {
    color: "#888",
    fontSize: 13,
    fontFamily: 'sans-serif'
  },
  feedText: {
    fontSize: 15,
    color: "#222",
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: 'sans-serif'
  },
  feedImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#eee",
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  addMenuBox: {
    marginTop: 60,
    marginRight: 18,
    borderRadius: 16,
    paddingVertical: 8,
    width: 200,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  addMenuText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    fontFamily: 'sans-serif-medium'
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    fontFamily: 'sans-serif-medium'
  },
  content: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 18,
    fontFamily: 'sans-serif'
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  postVideo: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e4e6eb",
    paddingTop: 12,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentIcon: {
    marginRight: 4,
  },
  commentCount: {
    fontSize: 14,
    color: "#666",
    fontFamily: 'sans-serif-medium'
  },
});