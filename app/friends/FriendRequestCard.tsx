import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import client, { BASE_URL } from '../api/client';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type User = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: string;
}

interface Props {
  request: FriendRequest;
  onAccepted?: () => void;
}

export default function FriendRequestCard({ request, onAccepted }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { user } = useAuth();

  const handleAccept = () => {
    client.post(`/friends/accept?requestId=${request.id}`)
      .then(() => {
        setAccepted(true);
        if (onAccepted) onAccepted();
      })
      .catch(error => console.error('Error accepting friend request:', error));
  };

  const handleDelete = () => {
    client.delete('/users/request', { 
      data: { fromUserId: request.id, toUserId: user?.id }
    })
      .then(() => setDeleted(true))
      .catch(error => console.error('Error deleting friend request:', error));
  };

  if (accepted || deleted) return null;

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: request.sender.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{request.sender.fullName || request.sender.username}</Text>
        <Text style={styles.username}>@{request.sender.username}</Text>
        <Text style={styles.mutual}>Wants to be your friend</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleAccept}>
          <LinearGradient
            colors={[COLORS.primary, '#1A4B8C']}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f2f5',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 4,
  },
  mutual: {
    color: COLORS.lightText,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: COLORS.lightText,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
