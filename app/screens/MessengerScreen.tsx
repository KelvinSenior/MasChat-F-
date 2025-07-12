import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Story = {
  id: string;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  image?: string;
  isCreate?: boolean;
  online?: boolean;
};

const stories: Story[] = [
  { id: "1", label: "Create story", icon: "add-circle", isCreate: true },
  { id: "2", label: "Memories", image: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: "3", label: "Yussif", image: "https://randomuser.me/api/portraits/men/2.jpg", online: true },
  { id: "4", label: "Yvonne", image: "https://randomuser.me/api/portraits/women/3.jpg", online: true },
  { id: "5", label: "Dolla", image: "https://randomuser.me/api/portraits/men/4.jpg", online: true },
];

const chats = [
  {
    id: "1",
    name: "Albert Kusi",
    message: "Hi",
    date: "Jan 25",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    unread: true,
  },
  {
    id: "2",
    name: "Emmanuel Larbi",
    message: "👍",
    date: "Dec 22, 2024",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    id: "3",
    name: "Preety Shy",
    message: "Hello",
    date: "Dec 20, 2024",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    id: "4",
    name: "Sarfo Kelvin Senior",
    message: "You: Has it come?",
    date: "Dec 9, 2024",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    online: true,
    time: "43m",
  },
  {
    id: "5",
    name: "Augustine Awelima",
    message: "Messages and calls are se...",
    date: "Oct 9, 2024",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
  },
];

export default function MessengerScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Messenger</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => router.push("/(create)/newMessage")}
          >
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.iconBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="create-outline" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push("/(tabs)/home")}
          >
            <LinearGradient 
              colors={['#667eea', '#764ba2']} 
              style={styles.iconBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome name="home" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stories and Chats */}
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesRow}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 12 }}
        >
          {stories.map((story) =>
            story.isCreate ? (
              <TouchableOpacity
                key={story.id}
                style={styles.storyItem}
                activeOpacity={0.8}
                onPress={() => router.push("/(create)/newStory")}
              >
                <LinearGradient
                  colors={['#a18cd1', '#fbc2eb']}
                  style={styles.createStoryCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={story.icon} size={28} color="white" />
                </LinearGradient>
                <Text style={styles.storyLabel}>{story.label}</Text>
              </TouchableOpacity>
            ) : (
              <View key={story.id} style={styles.storyItem}>
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
              </View>
            )
          )}
        </ScrollView>

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => router.push({ pathname: "/screens/ChatScreen", params: { recipient: JSON.stringify(item) } })}
            >
              <View style={styles.chatImageContainer}>
                <Image source={{ uri: item.image }} style={styles.chatImage} />
                {item.online && <View style={styles.onlineDotChat} />}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {item.message}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.chatDate}>{item.date}</Text>
                {item.time && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>{item.time}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity 
              style={styles.marketplaceContainer}
              onPress={() => router.push("/(tabs)/marketplace")}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.marketIconBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="storefront-outline" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.marketText}>Marketplace</Text>
            </TouchableOpacity>
          }
        />
      </View>
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
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
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
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "bold", 
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  headerIcons: { 
    flexDirection: "row" 
  },
  headerIconBtn: {
    borderRadius: 20,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 42,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: "#222",
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: 'sans-serif'
  },
  storiesRow: { 
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb'
  },
  storyItem: { 
    alignItems: "center", 
    marginRight: 16, 
    width: 80 
  },
  createStoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  storyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    marginBottom: 6,
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#fff'
  },
  storyLabel: {
    color: "#222",
    fontSize: 13,
    textAlign: "center",
    fontFamily: 'sans-serif-medium'
  },
  onlineDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#31a24c",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chatImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  chatImage: { 
    width: 56, 
    height: 56, 
    borderRadius: 28,
  },
  chatName: { 
    color: "#222", 
    fontWeight: "bold", 
    fontSize: 16,
    fontFamily: 'sans-serif-medium'
  },
  chatMessage: { 
    color: "#666", 
    fontSize: 14, 
    marginTop: 4,
    fontFamily: 'sans-serif'
  },
  chatDate: { 
    color: "#888", 
    fontSize: 12,
    fontFamily: 'sans-serif'
  },
  onlineDotChat: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#31a24c",
    borderWidth: 2,
    borderColor: "#fff",
  },
  timeBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  timeBadgeText: { 
    color: "#fff", 
    fontSize: 12, 
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
  },
  marketplaceContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  marketIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  marketText: { 
    color: "#222", 
    fontSize: 16, 
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
  },
});