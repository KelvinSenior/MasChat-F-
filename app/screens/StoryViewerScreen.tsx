import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchStories, Story } from '../lib/services/storyService';

import { Colors } from '../../constants/Colors';

export default function StoryViewerScreen() {
  const router = useRouter();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    setLoading(true);
    try {
      const allStories = await fetchStories();
      setStory(allStories.find(s => s.id === storyId) || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            router.replace('/(tabs)/videos');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} />
      ) : !story ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>Story not found.</Text>
        </View>
      ) : (
        <View style={styles.storyContent}>
          <Image source={{ uri: story.mediaUrl }} style={styles.storyImage} />
          <View style={styles.storyInfo}>
            <Text style={styles.storyUser}>{story.username}</Text>
            <Text style={styles.storyCaption}>{story.caption}</Text>
            <Text style={styles.storyTime}>{new Date(story.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      )}
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
  storyContent: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  storyImage: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  storyInfo: {
    alignItems: 'center',
  },
  storyUser: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  storyCaption: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  storyTime: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.lightText,
    fontSize: 16,
    marginTop: 16,
  },
}); 