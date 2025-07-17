import { Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CommentDialog from "../components/CommentDialog";
import { useAuth } from '../context/AuthContext';
import { getPosts, likePost, unlikePost } from "../lib/services/postService";

// Color Palette
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

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

  const handleLike = async (postId: number|string) => {
    if (!user) return;
    await likePost(Number(postId), Number(user.id));
    fetchPosts();
  };

  const handleUnlike = async (postId: number|string) => {
    if (!user) return;
    await unlikePost(Number(postId), Number(user.id));
    fetchPosts();
  };

  if (!user) {
    return <View style={styles.loadingContainer}><Text>User not found</Text></View>;
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
            style={styles.iconBtn}
            onPress={() => setShowAddMenu(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('../screens/SearchScreen')}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('../screens/MessengerScreen')}>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
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
          <View style={styles.addMenuBox}>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newPost");
              }}
            >
              <View style={[styles.menuIconBg, { backgroundColor: COLORS.primary }]}> 
                <Ionicons name="create-outline" size={22} color="white" />
              </View>
              <Text style={styles.addMenuText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newStory");
              }}
            >
              <View style={[styles.menuIconBg, { backgroundColor: COLORS.accent }]}> 
                <Ionicons name="images-outline" size={22} color="white" />
              </View>
              <Text style={styles.addMenuText}>Story</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newReel");
              }}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#A259E6' }]}> 
                <Ionicons name="film-outline" size={22} color="white" />
              </View>
              <Text style={styles.addMenuText}>Reels</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/LiveScreen");
              }}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#0A2463' }]}> 
                <Ionicons name="radio-outline" size={22} color="white" />
              </View>
              <Text style={styles.addMenuText}>Live</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Status Update */}
        <View style={styles.statusContainer}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image
              source={{ uri: user?.profilePicture ?? DEFAULT_PROFILE_PHOTO }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.statusInput}
            placeholder="What's on your mind?"
            placeholderTextColor={COLORS.lightText}
          />
          <TouchableOpacity style={styles.photoBtn} onPress={() => router.push('/(create)/newPost')}>
            <Ionicons name="image" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Stories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {stories.map((story) => (
            <TouchableOpacity key={story.id} style={styles.storyItem} onPress={() => {
              if (story.isCreate) {
                router.push('/(create)/newStory');
              } else {
                router.push('/profile');
              }
            }}>
              {story.isCreate ? (
                <View style={[styles.storyImageContainer, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name={story.icon as any} size={28} color="white" />
                </View>
              ) : (
                <View style={styles.storyImageContainer}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                  {story.online && <View style={styles.onlineDot} />}
                </View>
              )}
              <Text style={styles.storyLabel}>{story.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Posts */}
        <View style={styles.post}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: user?.profilePicture ?? DEFAULT_PROFILE_PHOTO }}
              style={styles.postAvatar}
            />
            <View style={styles.postUserInfo}>
              <Text style={styles.postUserName}>{user?.fullName ?? 'User'}</Text>
              <Text style={styles.postTime}>1d · <Feather name="globe" size={12} color={COLORS.lightText} /></Text>
            </View>
            <Feather name="more-horizontal" size={20} color={COLORS.lightText} />
          </View>
          <Text style={styles.postText}>Check out this awesome place! The sunset views here are breathtaking.</Text>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" }}
            style={styles.postImage}
          />
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction} onPress={() => handleLike(1)}>
              <FontAwesome name="thumbs-up" size={18} color={COLORS.lightText} />
              <Text style={styles.postActionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction} onPress={() => setCommentPostId(1)}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.lightText} />
              <Text style={styles.postActionText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.lightText} />
              <Text style={styles.postActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Second Post */}
        <View style={styles.post}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
              style={styles.postAvatar}
            />
            <View style={styles.postUserInfo}>
              <Text style={styles.postUserName}>Sarah Johnson</Text>
              <Text style={styles.postTime}>3h · <Feather name="globe" size={12} color={COLORS.lightText} /></Text>
            </View>
            <Feather name="more-horizontal" size={20} color={COLORS.lightText} />
          </View>
          <Text style={styles.postText}>Just finished this amazing book! Highly recommend for personal development.</Text>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f" }}
            style={styles.postImage}
          />
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.postAction} onPress={() => handleLike(2)}>
              <FontAwesome name="thumbs-up" size={18} color={COLORS.lightText} />
              <Text style={styles.postActionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction} onPress={() => setCommentPostId(2)}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.lightText} />
              <Text style={styles.postActionText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postAction}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.lightText} />
              <Text style={styles.postActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Comment Dialog */}
      {commentPostId && (
        <CommentDialog
          postId={commentPostId}
          userId={user.id}
          onClose={() => setCommentPostId(null)}
          onComment={fetchPosts}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  statusInput: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    fontSize: 15,
    color: COLORS.text,
  },
  photoBtn: {
    marginLeft: 10,
  },
  storiesContainer: {
    paddingVertical: 12,
    paddingLeft: 12,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  storyImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyLabel: {
    fontSize: 12,
    color: COLORS.text,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CD137',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  post: {
    backgroundColor: COLORS.white,
    marginBottom: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 16,
  },
  postTime: {
    color: COLORS.lightText,
    fontSize: 13,
  },
  postText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1, // Square format
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 16,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  postActionText: {
    marginLeft: 6,
    color: COLORS.lightText,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  addMenuBox: {
    marginTop: 60,
    marginRight: 18,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    width: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addMenuText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
});