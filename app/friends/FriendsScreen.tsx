import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import FriendCard from './FriendCard';
import { useAuth } from '../context/AuthContext';
import client, { BASE_URL } from '../api/client';
import { useFocusEffect } from '@react-navigation/native';

type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const fetchFriends = () => {
    if (!user?.id) return;
    setLoading(true);
    client.get(`/friends/list/${user.id}`)
      .then(res => res.data)
      .then((data: Friend[]) => {
        setFriends(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching friends:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFriends();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [user?.id])
  );

  const filteredFriends = friends.filter(f => f.fullName?.toLowerCase().includes(search.toLowerCase()));

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#1877f2" />;
    }
    if (filteredFriends.length === 0) {
      return <Text style={styles.emptyText}>No friends found</Text>;
    }
    return filteredFriends.map(friend => (
      <View key={friend.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Image source={{ uri: friend.profilePicture }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#eee' }} />
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222' }}>{friend.username}</Text>
      </View>
    ));
  };

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your friends</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search friends"
        value={search}
        onChangeText={setSearch}
      />
      {/* Tabs Row */}
      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => router.push('/friends/SuggestionsScreen')}>
          <Text style={styles.tabText}>Suggestions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => router.push('/friends/FriendRequestsScreen')}>
          <Text style={styles.tabText}>Friend Requests</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>{friends.length} friends</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
        {renderContent()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  backBtn: { marginRight: 12 },
  backText: { color: '#1877f2', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' },
  searchBtn: { marginLeft: 12 },
  searchIcon: { fontSize: 22, color: '#222' },
  searchInput: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, color: '#222' },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  tabBtn: { padding: 8 },
  tabText: { color: '#666', fontWeight: 'bold' },
  tabTextActive: { color: '#1877f2', fontWeight: 'bold', textDecorationLine: 'underline' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#888' },
});
