import React, { useState } from "react";
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { addComment } from "../lib/services/postService";

interface CommentDialogProps {
  postId: string;
  userId: string;
  onClose: () => void;
  onComment: () => void;
}

export default function CommentDialog({ postId, userId, onClose, onComment }: CommentDialogProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComment = async () => {
    setLoading(true);
    await addComment(postId, userId, comment);
    setComment("");
    setLoading(false);
    onComment();
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Add a comment</Text>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleComment} disabled={loading || !comment.trim()} style={styles.sendBtn}>
              <Text style={styles.sendText}>{loading ? "Sending..." : "Send"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#0008", justifyContent: "center", alignItems: "center" },
  dialog: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "90%" },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, minHeight: 60, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { marginRight: 16 },
  cancelText: { color: "#888" },
  sendBtn: { backgroundColor: "#1877f2", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  sendText: { color: "#fff", fontWeight: "bold" }
});