import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  const handleAccept = () => {
    client.post(`/friends/accept/${request.id}`)
      .then(() => {
        setAccepted(true);
        if (onAccepted) onAccepted();
      })
      .catch(error => console.error('Error accepting friend request:', error));
  };

  const handleDelete = () => {
    client.delete(`/friends/request/${request.id}`)
      .then(() => setDeleted(true))
      .catch(error => console.error('Error deleting friend request:', error));
  };

  const handleViewProfile = () => {
    if (!request?.sender?.id) {
      Alert.alert('Error', 'User information is missing.');
      return;
    }
    router.push({
      pathname: "/screens/FriendsProfileScreen",
      params: { userId: request.sender.id }
    });
  };

  const handleMessage = () => {
    if (!request?.sender?.id) {
      Alert.alert('Error', 'User information is missing.');
      return;
    }
    const recipient = {
      id: request.sender.id,
      username: request.sender.username,
      name: request.sender.fullName || request.sender.username,
      image: request.sender.profilePicture || '',
      profilePicture: request.sender.profilePicture || '',
      fullName: request.sender.fullName || '',
    };
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(recipient) }
    });
  };

  if (accepted || deleted) return null;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handleViewProfile} style={styles.userSection}>
        <Image 
          source={{ uri: request.sender.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{request.sender.fullName || request.sender.username}</Text>
          <Text style={styles.username}>@{request.sender.username}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="close" size={20} color="white" />
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: COLORS.lightText,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  acceptButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
  },
});
