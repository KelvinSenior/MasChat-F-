import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import client, { BASE_URL } from '../api/client';

type Suggestion = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function SuggestionCard({ suggestion }: { suggestion: Suggestion }): React.JSX.Element {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    client.post('/users/request', { toUserId: suggestion.id })
      .then(() => setAdded(true))
      .catch(error => console.error('Error sending friend request:', error));
  };

  return (
    <LinearGradient colors={['#fff', '#f8f9fa']} style={styles.card}>
      <Image source={{ uri: suggestion.profilePicture }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{suggestion.fullName || suggestion.username}</Text>
      </View>
      {added ? (
        <Text style={styles.addedText}>Request Sent</Text>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addText}>Add friend</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.removeBtn}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, marginBottom: 12, backgroundColor: '#fff', elevation: 2 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  mutual: { color: '#666', fontSize: 13 },
  addBtn: { backgroundColor: '#1877f2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  addText: { color: '#fff', fontWeight: 'bold' },
  addedText: { color: '#22c55e', fontWeight: 'bold', marginRight: 8 },
  removeBtn: { backgroundColor: '#eee', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  removeText: { color: '#666', fontWeight: 'bold' },
});
