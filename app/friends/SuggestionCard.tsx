import { Ionicons } from "@expo/vector-icons";
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

type Suggestion = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

interface Props {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: Props) {
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSendRequest = () => {
    if (!user?.id || user.id === suggestion.id) return;
    client.post('/friends/request', null, {
      params: {
        senderId: user.id,
        recipientId: suggestion.id
      }
    })
    .then(() => setSent(true))
    .catch(error => console.error('Error sending friend request:', error));
  };

  const handleViewProfile = () => {
    router.push({
      pathname: "/screens/FriendsProfileScreen",
      params: { userId: suggestion.id }
    });
  };

  const handleMessage = () => {
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(suggestion) }
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handleViewProfile} style={styles.userSection}>
        <Image 
          source={{ uri: suggestion.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{suggestion.fullName || suggestion.username}</Text>
          <Text style={styles.username}>@{suggestion.username}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addButton, sent && styles.sentButton]} 
          onPress={handleSendRequest}
          disabled={sent || user?.id === suggestion.id}
        >
          <Ionicons name={sent ? "checkmark" : "person-add"} size={20} color="white" />
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
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
  },
  sentButton: {
    backgroundColor: '#22c55e',
  },
});
