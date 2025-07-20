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
import { uploadImage } from '../lib/services/userService';
import { LinearGradient } from 'expo-linear-gradient';

// Color Palette (matching home/friends screens)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

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
  const [audio, setAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.type === 'video') setVideo(asset.uri);
      else if (asset.type === 'image') setImage(asset.uri);
      // Remove audio handling since it's not supported in posts
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
      let imageUrl = null;
      if (image) {
        // For posts, we'll handle the image URL directly without using uploadImage
        imageUrl = image; // Use the local URI directly for now
      }
      await createPost({
        content: post,
        imageUrl: image || undefined,
        videoUrl: video || undefined,
      }, user.id);
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
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/home');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.postButton}>
          <Text style={[styles.postButtonText, isLoading && styles.disabledBtn]}>
            {isLoading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* User Info and Controls */}
      <View style={styles.userRow}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.fullName || user.username}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            <TouchableOpacity style={styles.chip}>
              <Ionicons name="earth" size={14} color={COLORS.primary} />
              <Text style={styles.chipText}>Public</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Ionicons name="albums" size={14} color={COLORS.primary} />
              <Text style={styles.chipText}>Album</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Post Input */}
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor={COLORS.lightText}
        multiline
        value={post}
        onChangeText={setPost}
      />

      {/* Image/Video Picker */}
      <View style={styles.pickerContainer}>
        <TouchableOpacity onPress={pickMedia} style={styles.pickButton}>
          <Ionicons name="images" size={24} color={COLORS.accent} />
          <Text style={styles.pickButtonText}>Add Media</Text>
        </TouchableOpacity>
      </View>

      {/* Preview Selected Media */}
      {(image || video || audio) && (
        <View style={styles.previewContainer}>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          {video && <Text style={styles.previewText}>Video selected</Text>}
          {audio && <Text style={styles.previewText}>Audio selected</Text>}
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
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <Ionicons name="image-outline" size={28} color="#222" />
          <Text style={styles.optionText}>Add Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <Ionicons name="videocam-outline" size={28} color="#222" />
          <Text style={styles.optionText}>Add Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <Ionicons name="location-outline" size={28} color="#222" />
          <Text style={styles.optionText}>Add Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  postButton: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#f0f2f5',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fd',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 13,
    marginHorizontal: 3,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  pickButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  previewText: {
    color: COLORS.lightText,
    fontSize: 16,
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 16,
  },
});