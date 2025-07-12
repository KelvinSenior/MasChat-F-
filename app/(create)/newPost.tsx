import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { createPost } from '../lib/services/postService';

const options = [
  {
    icon: <Ionicons name="image" size={22} color="#22c55e" />,
    label: "Photo/video",
  },
  {
    icon: <FontAwesome5 name="smile" size={22} color="#fbbf24" />,
    label: "Feeling/activity",
  },
  {
    icon: <Entypo name="location-pin" size={22} color="#ef4444" />,
    label: "Check in",
  },
  {
    icon: <Ionicons name="videocam" size={22} color="#ef4444" />,
    label: "Live video",
  },
];

export default function NewPost() {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickVideo = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideo(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }
    if (!post.trim() && !image && !video) {
      Alert.alert("Error", "Post cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      let postData: any = {
        content: post,
        userId: user.id,
      };
      if (image) postData.imageUrl = image;
      if (video) postData.videoUrl = video;
      await createPost(postData);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>User not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create post</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
          <Text style={[styles.nextBtn, isLoading && styles.disabledBtn]}>
            {isLoading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Info and Controls */}
      <View style={styles.userRow}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.fullName || user.username}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            <TouchableOpacity style={styles.chip}>
              <Ionicons name="earth" size={14} color="#1877f2" />
              <Text style={styles.chipText}>Public</Text>
              <Ionicons name="chevron-down" size={14} color="#1877f2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Ionicons name="albums" size={14} color="#1877f2" />
              <Text style={styles.chipText}>Album</Text>
              <Ionicons name="chevron-down" size={14} color="#1877f2" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Post Input */}
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor="#888"
        multiline
        value={post}
        onChangeText={setPost}
      />

      {/* Image/Video Picker */}
      <View style={styles.pickerContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.pickButton}>
          <Ionicons name="image" size={24} color="#fff" />
          <Text style={styles.pickButtonText}>Add Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickVideo} style={styles.pickButton}>
          <Ionicons name="videocam" size={24} color="#fff" />
          <Text style={styles.pickButtonText}>Add Video</Text>
        </TouchableOpacity>
      </View>

      {/* Preview Selected Media */}
      {(image || video) && (
        <View style={styles.previewContainer}>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          {video && <Text style={styles.previewText}>Video selected</Text>}
        </View>
      )}

      {/* Options Sheet */}
      <View style={styles.optionsSheet}>
        <View style={styles.optionsHandle} />
        {options.map((opt) => (
          <TouchableOpacity key={opt.label} style={styles.optionRow}>
            {opt.icon}
            <Text style={styles.optionLabel}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  nextBtn: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7f0fd",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    color: "#1877f2",
    fontSize: 13,
    marginHorizontal: 3,
    fontWeight: "500",
  },
  input: {
    minHeight: 80,
    fontSize: 18,
    color: "#222",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1877f2",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
  },
  pickButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  previewContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  previewText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
  },
  optionsSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  optionsHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionLabel: {
    fontSize: 16,
    color: "#222",
    marginLeft: 16,
  },
});