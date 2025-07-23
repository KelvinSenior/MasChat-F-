import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPost, deletePost, Post } from '../lib/services/postService';
import { useAuth } from '../context/AuthContext';

import { Colors } from '../../constants/Colors';

export default function PostViewerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const p = await getPost(postId);
      setPost(p);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deletePost(post.id, user.id);
        router.back();
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.reelItem, { backgroundColor: Colors.light.primary, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator color={Colors.light.white} size="large" />
      </View>
    );
  }
  if (!post) {
    return (
      <View style={[styles.reelItem, { backgroundColor: Colors.light.primary, justifyContent: 'center', alignItems: 'center' }]}> 
        <Ionicons name="image-outline" size={60} color={Colors.light.lightText} />
        <Text style={styles.emptyText}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.reelItem, { backgroundColor: '#111' }]}> 
      {/* Back Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 20,
          padding: 8,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
      {/* Post Media */}
      <View style={styles.postMediaContainer}>
        {post.videoUrl ? (
          <Video
            source={{ uri: post.videoUrl }}
            style={styles.postMedia}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            isMuted={false}
            useNativeControls={false}
            onError={(error) => {
              Alert.alert('Video error', 'Could not load video.');
            }}
          />
        ) : post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.postMedia} resizeMode="contain" />
        ) : null}
      </View>
      {/* Post Info */}
      <View style={styles.postInfoContainer}>
        <View style={styles.postUserInfo}>
          <Image source={{ uri: post.user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.reelAvatar} />
          <Text style={[styles.reelUsername, { color: Colors.light.white }]}>{post.user?.username || 'Anonymous'}</Text>
          <TouchableOpacity style={[styles.followButton, { backgroundColor: Colors.light.white }] }>
            <Text style={[styles.followButtonText, { color: Colors.light.primary }]}>Follow</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.reelCaption, { color: Colors.light.white }]}>{post.content}</Text>
      </View>
      {/* TikTok-style Action Buttons on the right */}
      <View style={styles.tiktokActionBar}>
        <View style={styles.tiktokActionButton}>
          <Ionicons name="heart" size={32} color={Colors.light.white} />
          <Text style={[styles.tiktokActionCount, { color: Colors.light.white }]}>{post.likedBy?.length || 0}</Text>
        </View>
        <View style={styles.tiktokActionButton}>
          <Ionicons name="chatbubble" size={32} color={Colors.light.white} />
          <Text style={[styles.tiktokActionCount, { color: Colors.light.white }]}>{post.comments?.length || 0}</Text>
        </View>
        <View style={styles.tiktokActionButton}>
          <Ionicons name="send" size={32} color={Colors.light.white} />
          <Text style={[styles.tiktokActionCount, { color: Colors.light.white }]}>{post.shareCount || 0}</Text>
        </View>
        {user?.id === post.user?.id && (
          <TouchableOpacity style={styles.tiktokActionButton} onPress={handleDelete}>
            <Ionicons name="trash" size={32} color={Colors.light.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reelItem: {
    width: '100%',
    height: Dimensions.get('window').height,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postMediaContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  postMedia: {
    width: '100%',
    height: '100%',
  },
  postInfoContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 10,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reelAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  reelUsername: {
    color: Colors.light.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  followButton: {
    backgroundColor: Colors.light.white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  followButtonText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reelCaption: {
    color: Colors.light.white,
    fontSize: 14,
    marginBottom: 5,
  },
  tiktokActionBar: {
    position: 'absolute',
    right: 20,
    top: '35%',
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiktokActionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tiktokActionCount: {
    color: Colors.light.white,
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  emptyText: {
    color: Colors.light.lightText,
    fontSize: 16,
    marginTop: 16,
  },
});