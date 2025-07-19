import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { fetchReels, deleteReel, Reel, likeReel, unlikeReel, addReelComment, shareReel, fetchReelComments, ReelComment } from '../lib/services/reelService';

const COLORS = {
  primary: '#0A2463',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function ReelsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalReel, setCommentModalReel] = useState<Reel | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);

  useEffect(() => {
    fetchAllReels();
  }, []);

  const fetchAllReels = async () => {
    setLoading(true);
    try {
      const data = await fetchReels();
      setReels(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reelId: string) => {
    Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteReel(reelId, user?.id);
        fetchAllReels();
      }},
    ]);
  };

  const handleLike = async (reel: Reel) => {
    if (!user) return;
    if (reel.likedBy?.includes(user.id)) {
      await unlikeReel(reel.id, user.id);
    } else {
      await likeReel(reel.id, user.id);
    }
    fetchAllReels();
  };

  const handleShare = async (reelId: string) => {
    await shareReel(reelId);
    fetchAllReels();
  };

  const handleAddComment = async () => {
    if (!commentModalReel || !user || !commentText.trim()) return;
    setCommentLoading(true);
    await addReelComment(commentModalReel.id, user.id, commentText.trim());
    setCommentText('');
    setCommentLoading(false);
    setCommentModalReel(null);
    fetchAllReels();
  };

  const openCommentModal = async (reel: Reel) => {
    setCommentModalReel(reel);
    const data = await fetchReelComments(reel.id);
    setComments(data);
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
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity onPress={() => router.push('/(create)/newReel')} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={COLORS.accent} />
        </TouchableOpacity>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : reels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={60} color={COLORS.lightText} />
            <Text style={styles.emptyText}>No reels yet.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(create)/newReel')}>
              <Text style={styles.createBtnText}>Create New Reel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reels.map(reel => (
            <View key={reel.id} style={styles.reelCard}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push({ pathname: '/screens/ReelViewerScreen', params: { reelId: reel.id } })}
              >
                <Image source={{ uri: reel.mediaUrl }} style={styles.reelImage} />
                <View style={styles.reelInfo}>
                  <Text style={styles.reelUser}>{reel.username}</Text>
                  <Text style={styles.reelCaption}>{reel.caption}</Text>
                  <Text style={styles.reelTime}>{new Date(reel.createdAt).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.reelActions}>
                <TouchableOpacity onPress={() => user && handleLike(reel)} style={styles.actionBtn}>
                  <Ionicons name={reel.likedBy?.includes(user?.id || '') ? 'heart' : 'heart-outline'} size={22} color={reel.likedBy?.includes(user?.id || '') ? COLORS.accent : COLORS.lightText} />
                  <Text style={styles.actionCount}>{reel.likedBy?.length || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openCommentModal(reel)} style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={22} color={COLORS.lightText} />
                  <Text style={styles.actionCount}>{reel.comments?.length || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShare(reel.id)} style={styles.actionBtn}>
                  <Ionicons name="share-social-outline" size={22} color={COLORS.lightText} />
                  <Text style={styles.actionCount}>{reel.shareCount || 0}</Text>
                </TouchableOpacity>
                {user?.id === reel.userId && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(reel.id)}>
                    <Ionicons name="trash" size={22} color={COLORS.accent} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {/* Comment Modal */}
      {commentModalReel && (
        <Modal
          visible={!!commentModalReel}
          transparent
          animationType="slide"
          onRequestClose={() => setCommentModalReel(null)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              minHeight: 320,
              maxHeight: '60%',
              width: '100%',
              alignSelf: 'flex-end',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#eee', marginBottom: 8 }} />
                <Text style={styles.commentModalTitle}>Comments</Text>
              </View>
              <ScrollView style={{ maxHeight: 180, width: '100%' }}>
                {comments.length === 0 ? (
                  <Text style={{ color: COLORS.lightText, textAlign: 'center', marginVertical: 12 }}>No comments yet.</Text>
                ) : (
                  comments.map(c => (
                    <View key={c.id} style={{ marginBottom: 10 }}>
                      <Text style={{ fontWeight: 'bold' }}>{c.username}</Text>
                      <Text style={{ color: COLORS.text }}>{c.text}</Text>
                      <Text style={{ color: COLORS.lightText, fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity style={styles.commentSendBtn} onPress={handleAddComment} disabled={commentLoading}>
                <Text style={styles.commentSendText}>{commentLoading ? 'Posting...' : 'Send'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentCancelBtn} onPress={() => setCommentModalReel(null)}>
                <Text style={styles.commentCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.lightText,
    marginTop: 40,
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
    marginBottom: 24,
  },
  createBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  reelImage: {
    width: 80,
    height: 120,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  reelInfo: {
    flex: 1,
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
  },
  reelTime: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 6,
  },
  reelActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  actionCount: {
    color: COLORS.lightText,
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentModalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    margin: 32,
    alignItems: 'center',
  },
  commentModalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 12,
    width: 240,
    minHeight: 60,
    fontSize: 15,
    marginBottom: 12,
  },
  commentSendBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 8,
  },
  commentSendText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  commentCancelBtn: {
    marginTop: 4,
  },
  commentCancelText: {
    color: COLORS.lightText,
    fontWeight: 'bold',
  },
}); 