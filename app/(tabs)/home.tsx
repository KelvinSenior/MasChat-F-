import { Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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

export default function HomeScreen() {
  const router = useRouter();
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          Mas
          <Text style={styles.logoChat}>Chat</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowAddMenu(true)}
          >
            <Ionicons name="add" size={24} color="#050505" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/SearchScreen')}>
            <Ionicons name="search" size={24} color="#1877f2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/MessengerScreen")}>
            <Ionicons name="chatbubble-ellipses" size={28} color="#050505" />
          </TouchableOpacity>
        </View>
      </View>

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
              <Ionicons name="create-outline" size={22} color="#222" />
              <Text style={styles.addMenuText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newStory");
              }}
            >
              <Ionicons name="images-outline" size={22} color="#222" />
              <Text style={styles.addMenuText}>Story</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/newReel");
              }}
            >
              <Ionicons name="film-outline" size={22} color="#222" />
              <Text style={styles.addMenuText}>Reel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setShowAddMenu(false);
                router.push("/(create)/LiveScreen");
              }}
            >
              <Ionicons name="videocam-outline" size={22} color="#222" />
              <Text style={styles.addMenuText}>Live</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* What's on your mind */}
        <View style={styles.statusContainer}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }} // Replace with user's profile image URI
            style={styles.avatar}
          />
        </TouchableOpacity>
          <TextInput
            style={styles.statusInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => router.push("/editProfile")}>
          <MaterialIcons name="photo-library" size={28} color="#1877f2" />
          </TouchableOpacity>
        </View>

        {/* Stories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow}>
          {stories.map((story) =>
  story.isCreate ? (
    <TouchableOpacity 
      key={story.id} 
      style={styles.storyItem}
      onPress={() => router.push("/(create)/newStory")}
    >
      <View style={styles.createStoryCircle}>
        <Ionicons name={story.icon as any} size={54} color="#1877f2" />
      </View>
      <Text style={styles.storyLabel}>{story.label}</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity key={story.id} style={styles.storyItem}>
      <View>
        <Image source={{ uri: story.image }} style={styles.storyImage} />
        {story.online && <View style={styles.onlineDot} />}
      </View>
      <Text style={styles.storyLabel}>{story.label}</Text>
    </TouchableOpacity>
  )
)}
        </ScrollView>

        {/* Feed */}
        <View style={styles.feed}>
          <View style={styles.feedHeader}>
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
              style={styles.feedAvatar}
            />
            <View>
              <Text style={styles.feedName}>SikaCash Empiregh</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.feedTime}>1d</Text>
                <Feather name="globe" size={12} color="#888" style={{ marginLeft: 4 }} />
              </View>
            </View>
            <Feather name="more-horizontal" size={20} color="#888" style={{ marginLeft: "auto" }} />
          </View>
          <Text style={styles.feedText}>Check out this awesome place!</Text>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.feedImage}
          />
          <View style={styles.feedActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <FontAwesome name="thumbs-o-up" size={20} color="#1877f2" />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={20} color="#1877f2" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="arrow-redo-outline" size={20} color="#1877f2" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Add more feed items here as needed */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "sans-serif",
    letterSpacing: 1,
    flex: 1,
    color: "#1877f2", // blue for "Mas"
  },
  logoChat: {
    color: "#ff9800", // orange for "Chat"
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    backgroundColor: "#e4e6eb",
    borderRadius: 20,
    padding: 6,
    marginLeft: 10,
  },
  scroll: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 8,
    marginHorizontal: 0,
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
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
  },
  storiesRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingLeft: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  story: {
    width: 80,
    alignItems: "center",
    marginRight: 10,
    position: "relative",
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "#1877f2",
  },
  addStoryBtn: {
    position: "absolute",
    bottom: 24,
    left: 28,
    backgroundColor: "#1877f2",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  storyRing: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#1877f2",
  },
  storyLabel: {
    fontSize: 12,
    color: "#222",
    textAlign: "center",
    marginTop: 2,
  },
  feed: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 0,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  feedName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
  },
  feedTime: {
    color: "#888",
    fontSize: 12,
  },
  feedText: {
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
  },
  feedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  feedActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e4e6eb",
    paddingTop: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    color: "#1877f2",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  createStoryCircle: {
    width: 72, // Increased width
    height: 72, // Increased height
    borderRadius: 36,
    backgroundColor: "#23272f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  storyImage: {
    width: 64, // Increased width
    height: 64, // Increased height
    borderRadius: 32,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "#1877f2",
  },
  storyItem: { alignItems: "center", marginRight: 18, width: 80 }, // Adjust width for larger icon
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  addMenuBox: {
    marginTop: 60,
    marginRight: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    width: 170,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  addMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  addMenuText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 14,
    fontWeight: "500",
  },
});