import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchReels, deleteReel, Reel } from '../lib/services/reelService';
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

export default function ReelViewerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { reelId } = useLocalSearchParams<{ reelId: string }>();
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReel();
  }, [reelId]);

  const fetchReel = async () => {
    setLoading(true);
    try {
      const allReels = await fetchReels();
      setReel(allReels.find(r => r.id === reelId) || null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reel) return;
    Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteReel(reel.id, user.id);
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
        <Text style={styles.headerTitle}>Reel</Text>
        {reel && user && user.id === reel.userId ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </LinearGradient>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} />
      ) : !reel ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>Reel not found.</Text>
        </View>
      ) : (
        <View style={styles.reelContent}>
          {reel.mediaUrl.endsWith('.mp4') ? (
            <Video
              source={{ uri: reel.mediaUrl }}
              style={styles.reelVideo}
              useNativeControls
              resizeMode="contain"
              shouldPlay
              isLooping
            />
          ) : (
            <Image source={{ uri: reel.mediaUrl }} style={styles.reelImage} />
          )}
          <View style={styles.reelInfo}>
            <Text style={styles.reelUser}>{reel.username}</Text>
            <Text style={styles.reelCaption}>{reel.caption}</Text>
            <Text style={styles.reelTime}>{new Date(reel.createdAt).toLocaleString()}</Text>
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
  reelContent: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  reelVideo: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  reelImage: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  reelInfo: {
    alignItems: 'center',
  },
  reelUser: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  reelCaption: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  reelTime: {
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