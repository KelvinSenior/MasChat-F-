import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getAllPosts, Post } from '../lib/services/postService';
import { Video } from 'expo-av';

export default function Posts() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getAllPosts().then(data => {
      setPosts(data);
      setLoading(false);
      if (postId) {
        const idx = data.findIndex(p => p.id === postId);
        if (idx !== -1) {
          setCurrentIndex(idx);
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: idx * Dimensions.get('window').height, animated: false });
          }, 100);
        }
      }
    });
  }, [postId]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = Dimensions.get('window').height;
    const newIndex = Math.round(offsetY / height);
    setCurrentIndex(newIndex);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView
        ref={scrollRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {posts.map((post, idx) => (
          <View key={post.id} style={{ width: '100%', height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
            {post.videoUrl ? (
              <Video source={{ uri: post.videoUrl }} style={{ width: '100%', height: 320 }} resizeMode="cover" shouldPlay={idx === currentIndex} isLooping />
            ) : post.imageUrl ? (
              <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 320 }} />
            ) : null}
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{post.username}</Text>
            <Text style={{ color: '#fff', fontSize: 16 }}>{post.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 