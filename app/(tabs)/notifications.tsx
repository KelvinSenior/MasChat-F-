import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationRead, Notification, acceptFriendRequest, deleteFriendRequest } from '../lib/services/userService';
import client from '../api/client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Swipeable } from 'react-native-gesture-handler';
import { useNotification } from '../context/NotificationContext';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { showBanner } = useNotification();

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchNotifications(user.id)
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));

    // WebSocket for real-time notifications
    const socket = new SockJS('http://10.132.74.85:8080/ws-chat');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: str => console.log(str),
      onConnect: () => {
        client.subscribe(`/user/${user.id}/queue/notifications`, message => {
          const notif = JSON.parse(message.body);
          const newNotification = {
            id: notif.id?.toString() || `${Date.now()}`,
            message: notif.message,
            read: false,
            createdAt: notif.createdAt || new Date().toISOString(),
          };
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show banner for new notifications
          showBanner(notif.message);
        });
      },
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [user?.id]);

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const handleConfirmFriendRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    setNotifications(prev => prev.map(n => n.id === requestId ? { ...n, read: true, message: 'Friend request accepted.' } : n));
  };
  const handleDeleteFriendRequest = async (requestId: string) => {
    if (!user?.id) return;
    await deleteFriendRequest(requestId, user.id);
    setNotifications(prev => prev.filter(n => n.id !== requestId));
  };

  async function deleteNotification(notificationId: string) {
    await client.delete(`/notifications/${notificationId}`);
  }

  const renderRightActions = (notificationId: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 120 }}>
      <TouchableOpacity 
        style={{ backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', width: 60, height: '100%' }}
        onPress={() => handleMarkRead(notificationId)}
      >
        <Ionicons name="checkmark" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center', width: 60, height: '100%' }}
        onPress={async () => {
          await deleteNotification(notificationId);
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.logo}>
          Mas<Text style={{ color: COLORS.accent }}>Chat</Text>
        </Text>
        <TouchableOpacity
          onPress={() => router.push("../screens/SearchScreen")}
          style={styles.iconBtn}
        >
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Notifications Title */}
      <View style={styles.notificationsHeader}>
        <Text style={styles.notificationsTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>New</Text>
        {loading ? (
          <Text style={{ textAlign: 'center', marginVertical: 24 }}>Loading...</Text>
        ) : notifications.length === 0 ? (
          <Text style={{ textAlign: 'center', marginVertical: 24 }}>No notifications yet.</Text>
        ) : notifications.map((item) => (
          <Swipeable
            key={item.id}
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
          >
            <TouchableOpacity style={[styles.card, !item.read && { backgroundColor: '#e6f0ff' }]} onPress={() => handleMarkRead(item.id)}>
              <View style={styles.row}>
                <View style={styles.avatarContainer}>
                  {/* If item.avatar exists, show it, else show Ionicons */}
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  ) : (
                    <Ionicons name="notifications" size={20} color={item.read ? COLORS.lightText : COLORS.primary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
                  {/* Friend request actions */}
                  {item.message?.toLowerCase().includes('friend request') && !item.read && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <TouchableOpacity style={[styles.actionBtn, styles.primaryAction]} onPress={() => handleConfirmFriendRequest(item.id)}>
                        <Text style={[styles.actionText, styles.primaryText]}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.secondaryAction]} onPress={() => handleDeleteFriendRequest(item.id)}>
                        <Text style={[styles.actionText, styles.secondaryText]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {!item.read && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent, marginLeft: 8 }} />}
              </View>
            </TouchableOpacity>
          </Swipeable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#e4e6eb',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  mutual: {
    fontSize: 13,
    color: COLORS.lightText,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: 'flex-end',
    gap: 8
  },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
  },
  secondaryAction: {
    backgroundColor: '#e4e6eb',
  },
  actionText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.text,
  },
});