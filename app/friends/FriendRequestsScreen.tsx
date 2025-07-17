import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FriendRequestCard from './FriendRequestCard';
import { useAuth } from '../context/AuthContext';
import client, { BASE_URL } from '../api/client';

type User = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

type FriendRequest = {
  id: string;
  sender: User;
  recipient: User;
  status: string;
  createdAt: string;
};

export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    client.get(`/friends/requests/${user.id}`)
      .then(res => res.data)
      .then((data: FriendRequest[]) => {
        setRequests(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching friend requests:', error);
        setLoading(false);
      });
  }, [user?.id]);

  let content;
  if (loading) {
    content = <ActivityIndicator size="large" color="#1877f2" />;
  } else if (requests.length === 0) {
    content = <Text style={styles.emptyText}>No friend requests</Text>;
  } else {
    content = requests.map(req => <FriendRequestCard key={req.id} request={req.sender} />);
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabsRow}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => router.push('/friends/SuggestionsScreen')}>
          <Text style={styles.tabText}>Suggestions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]} onPress={() => {}}>
          <Text style={styles.tabTextActive}>Your friends</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Friend requests</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 80 }}>
        {content}
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
  tabsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 12 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 18, backgroundColor: '#f1f1f1', marginHorizontal: 4 },
  tabBtnActive: { backgroundColor: '#e4e8f0' },
  tabText: { color: '#222', fontWeight: 'bold', fontSize: 15 },
  tabTextActive: { color: '#1877f2', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, color: '#222' },
  scroll: { flex: 1, paddingHorizontal: 8 },
  emptyText: { textAlign: 'center', marginTop: 32, color: '#888' },
});
