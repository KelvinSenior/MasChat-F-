import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

type Props = {
  friend: Friend;
};

export default function FriendCard({ friend }: Props) {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <Image source={{ uri: friend.profilePicture }} style={styles.avatar} />
        <Text style={styles.name}>{friend.fullName || friend.username}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  // Define other styles as needed
});

export function FriendList({ filteredFriends, loading }: { filteredFriends: Friend[]; loading: boolean }) {
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#1877f2" />;
    }
    if (filteredFriends.length === 0) {
      return <Text style={emptyTextStyle}>No friends found</Text>;
    }
    return filteredFriends.map(friend => (
      <FriendCard
        key={friend.id}
        friend={friend}
      />
    ));
  };

  // Inline style for emptyText since it's not in StyleSheet.create
  const emptyTextStyle = {
    textAlign: 'center' as const,
    marginTop: 32,
    color: '#888',
  };

  return (
    <View>
      {renderContent()}
    </View>
  );
}
