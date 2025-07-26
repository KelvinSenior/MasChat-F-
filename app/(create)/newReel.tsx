import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createReel } from '../lib/services/reelService';

const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function NewReel() {
  const router = useRouter();
  const { user } = useAuth();
  const [video, setVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setVideo(asset.uri);
      setMediaType(asset.type);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }
    if (!video) {
      Alert.alert('Error', 'Please select a video for your reel.');
      return;
    }
    setIsLoading(true);
    try {
      // For demo, assume video is already uploaded. In production, upload to server/cloud first.
      await createReel({ mediaUrl: video, caption }, user.id);
      router.replace('/(tabs)/videos');
    } catch (error) {
      Alert.alert('Error', 'Failed to create reel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2B6CD9']}
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
        <Text style={styles.headerTitle}>Create Reel</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.postButton}>
          <Text style={[styles.postButtonText, isLoading && styles.disabledBtn]}>
            {isLoading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Video Picker */}
      <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
        {video ? (
          mediaType === 'video' ? <Text style={styles.mediaPlaceholderText}>Video selected</Text> :
          mediaType === 'image' ? <Image source={{ uri: video }} style={styles.mediaPreview} /> :
          mediaType === 'audio' ? <Text style={styles.mediaPlaceholderText}>Audio selected</Text> :
          null
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="videocam-outline" size={48} color={COLORS.lightText} />
            <Text style={styles.mediaPlaceholderText}>Tap to select image, video, or audio</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption Input */}
      <TextInput
        style={styles.captionInput}
        placeholder="Add a caption..."
        placeholderTextColor={COLORS.lightText}
        value={caption}
        onChangeText={setCaption}
        multiline
      />
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
  mediaPicker: {
    margin: 24,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mediaPreview: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 260,
  },
  mediaPlaceholderText: {
    color: COLORS.lightText,
    fontSize: 16,
    marginTop: 12,
  },
  captionInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});