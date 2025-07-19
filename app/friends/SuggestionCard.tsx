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

  const handleSendRequest = () => {
    if (!user?.id) return;
    client.post('/friends/request', {
      fromUserId: user.id,
      toUserId: suggestion.id
    })
      .then(() => setSent(true))
      .catch(error => console.error('Error sending friend request:', error));
  };

  if (sent) {
    return (
      <View style={styles.card}>
        <Image 
          source={{ uri: suggestion.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{suggestion.fullName || suggestion.username}</Text>
          <Text style={styles.username}>@{suggestion.username}</Text>
        </View>
        <View style={styles.sentButton}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
          <Text style={styles.sentText}>Sent</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: suggestion.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{suggestion.fullName || suggestion.username}</Text>
        <Text style={styles.username}>@{suggestion.username}</Text>
        <Text style={styles.mutual}>You may know this person</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleSendRequest}>
        <LinearGradient
          colors={[COLORS.accent, '#FF9E40']}
          style={styles.addGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="person-add" size={16} color="white" />
          <Text style={styles.addText}>Add</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  addButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
  },
  addText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  sentText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
