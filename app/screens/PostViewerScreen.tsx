import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPost, deletePost, Post } from '../lib/services/postService';
import { useAuth } from '../context/AuthContext';
import { Video } from 'expo-av';

const COLORS = {
  primary: '#0A2463',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

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
            router.replace('/(tabs)/home');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {post && user && user.id === post.userId ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </LinearGradient>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} />
      ) : !post ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>Post not found.</Text>
        </View>
      ) : (
        <View style={styles.postContent}>
          {post.videoUrl ? (
            <Video
              source={{ uri: post.videoUrl }}
              style={styles.postVideo}
              useNativeControls
              resizeMode="contain"
              shouldPlay
              isLooping
            />
          ) : post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          ) : null}
          <View style={styles.postInfo}>
            <Text style={styles.postUser}>{post.username}</Text>
            <Text style={styles.postCaption}>{post.content}</Text>
            <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString()}</Text>
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
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  postVideo: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  postImage: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  postInfo: {
    alignItems: 'center',
  },
  postUser: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  postCaption: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  postTime: {
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