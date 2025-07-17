import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function NewMessage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    client.get(`/friends/list/${user.id}`)
      .then(res => setFriends(res.data))
      .catch(console.error);
  }, [user?.id]);

  const filteredFriends = friends.filter(f =>
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Message</Text>
      </View>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search friends"
        value={search}
        onChangeText={setSearch}
      />
      {/* Suggested Friends */}
      <Text style={styles.sectionTitle}>Suggested</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {filteredFriends.map(friend => (
          <TouchableOpacity
            key={friend.id}
            style={styles.friendRow}
            onPress={() => router.push({
              pathname: '/screens/ChatScreen',
              params: { recipient: JSON.stringify(friend) }
            })}
          >
            <Image source={{ uri: friend.profilePicture }} style={styles.avatar} />
            <Text style={styles.friendName}>{friend.username}</Text>
          </TouchableOpacity>
        ))}
        {filteredFriends.length === 0 && (
          <Text style={styles.emptyText}>No friends found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'flex-start', backgroundColor: '#fff', elevation: 2 },
  backBtn: { marginRight: 12 },
  backText: { color: '#1877f2', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' },
  searchInput: { backgroundColor: '#fff', borderRadius: 8, padding: 10, margin: 16, borderWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, color: '#222' },
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#eee' },
  friendName: { fontSize: 16, color: '#222', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#888' },
});