import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FriendRequest = {
  _id: string;
  fullName: string;
  profilePicture: string;
  mutualFriends: number;
};

interface Props {
  request: FriendRequest;
}

export default function FriendRequestCard({ request }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleAccept = () => {
    fetch('http://localhost:8080/users/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId: request._id })
    }).then(() => setAccepted(true));
  };

  const handleDelete = () => {
    fetch('http://localhost:8080/users/request', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId: request._id, toUserId: /* current user id here */ '' })
    }).then(() => setDeleted(true));
  };

  if (accepted || deleted) return null;

  return (
    <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.card}>
      <Image source={{ uri: request.profilePicture }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{request.fullName}</Text>
        <Text style={styles.mutual}>{request.mutualFriends} mutual friends</Text>
      </View>
      <TouchableOpacity style={styles.confirmBtn} onPress={handleAccept}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, marginBottom: 12, backgroundColor: '#fff', elevation: 2 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  mutual: { color: '#666', fontSize: 13 },
  confirmBtn: { backgroundColor: '#1877f2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#eee', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  deleteText: { color: '#666', fontWeight: 'bold' },
});
