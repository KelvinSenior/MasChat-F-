import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Image } from "react-native";
import Modal from "react-native-modal";
import { addComment, fetchPostComments } from "../lib/services/postService";

interface CommentDialogProps {
  postId: string;
  userId: string;
  onClose: () => void;
  onComment: () => void;
  postOwnerId?: string;
}

export default function CommentDialog({ postId, userId, onClose, onComment, postOwnerId }: CommentDialogProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadComments = async () => {
    setRefreshing(true);
    const data = await fetchPostComments(postId);
    setComments(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleComment = async () => {
    setLoading(true);
    await addComment(postId, userId, comment);
    setComment("");
    setLoading(false);
    await loadComments();
    onComment();
  };

  return (
    <Modal
      isVisible
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={styles.modal}
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheet}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Comments</Text>
        <FlatList
          data={comments}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          refreshing={refreshing}
          onRefresh={loadComments}
          style={styles.commentsList}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                {item.profilePicture ? (
                  <Image source={{ uri: item.profilePicture }} style={styles.profilePhoto} />
                ) : (
                  <View style={styles.profilePhotoPlaceholder} />
                )}
                <Text style={styles.commentUser}>{item.username}</Text>
                {postOwnerId && item.userId?.toString() === postOwnerId?.toString() && (
                  <View style={styles.ownerTag}><Text style={styles.ownerTagText}>Owner</Text></View>
                )}
              </View>
              <Text style={styles.commentText}>{item.text || item.content}</Text>
              <Text style={styles.commentTime}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity onPress={handleComment} disabled={loading || !comment.trim()} style={styles.sendBtn}>
            <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    minHeight: 320,
    maxHeight: "95%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#eee",
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  commentsList: {
    flexGrow: 0,
    marginBottom: 8,
  },
  commentItem: {
    marginBottom: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 10,
  },
  commentUser: {
    fontWeight: "bold",
    color: "#0A2463",
    marginBottom: 2,
  },
  commentText: {
    color: "#333",
    fontSize: 15,
  },
  commentTime: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: "#f7f7f7",
  },
  sendBtn: {
    backgroundColor: "#1877f2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  profilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  profilePhotoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  ownerTag: {
    backgroundColor: '#1877f2',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  ownerTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});