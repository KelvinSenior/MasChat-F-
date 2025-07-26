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
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationRead, Notification, acceptFriendRequest, deleteFriendRequest, deleteNotification } from '../lib/services/userService';
import client from '../api/client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Swipeable } from 'react-native-gesture-handler';
import { useNotification } from '../context/NotificationContext';

// Modern Color Palette
const COLORS = {
  primary: '#4361EE',    // Vibrant Blue
  secondary: '#3A0CA3',  // Deep Purple
  accent: '#FF7F11',     // Orange
  background: '#F8F9FA',  // Light Gray
  card: '#FFFFFF',       // White
  white: '#FFFFFF',      // White
  text: '#212529',       // Dark Gray
  lightText: '#6C757D',  // Medium Gray
  border: '#E9ECEF',     // Light Border
  success: '#4CC9F0',    // Teal
  danger: '#FF3040',     // Red
  warning: '#FFC107',    // Yellow
  dark: '#1A1A2E',       // Dark Blue
};

const DEVICE_WIDTH = Dimensions.get('window').width;

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { showBanner } = useNotification();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchNotifications(user.id)
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));

    // WebSocket for real-time notifications
    const socket = new SockJS('http://10.94.219.125:8080/ws-chat');
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
    setNotifications(prev => prev.map(n =>
      n.id === requestId ? { ...n, read: true, message: 'Friend request accepted.' } : n
    ));
  };
  const handleDeleteFriendRequest = async (requestId: string) => {
    if (!user?.id) return;
    await deleteFriendRequest(requestId, user.id);
    setNotifications(prev => prev.filter(n => n.id !== requestId));
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications.filter(n => !n.read)) {
      await markNotificationRead(n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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
          await handleDeleteNotification(notificationId);
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
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.logo}>Notifications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Notifications Title & Mark All as Read */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.filter(n => !n.read).length}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <LinearGradient
              colors={[COLORS.accent, '#FF6B35']}
              style={styles.markAllGradient}
            >
              <Ionicons name="checkmark-done" size={16} color="white" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            if (user?.id) {
              const data = await fetchNotifications(user.id);
              setNotifications(data);
            }
            setRefreshing(false);
          }} />
        }
      >
        <Text style={styles.sectionLabel}>New</Text>
        {loading ? (
          <View style={{ padding: 24 }}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={[styles.card, { opacity: 0.5, backgroundColor: '#e4e6eb', marginBottom: 16 }]} />
            ))}
          </View>
        ) : notifications.length === 0 ? (
          <Text style={{ textAlign: 'center', marginVertical: 24 }}>No notifications yet.</Text>
        ) : notifications.map((item) => (
          <Swipeable
            key={item.id}
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
          >
            <Animated.View style={[
              styles.card,
              !item.read && styles.unreadCard,
              { borderLeftWidth: 4, borderLeftColor: !item.read ? COLORS.accent : 'transparent' }
            ]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => handleMarkRead(item.id)}>
                <View style={styles.row}>
                  <View style={[styles.avatarContainer, !item.read && styles.unreadAvatar]}>
                    {/* Use icon based on notification type */}
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : item.message?.toLowerCase().includes('friend request') ? (
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="person-add" size={20} color="white" />
                      </LinearGradient>
                    ) : item.message?.toLowerCase().includes('like') ? (
                      <LinearGradient
                        colors={[COLORS.danger, '#FF6B6B']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="heart" size={20} color="white" />
                      </LinearGradient>
                    ) : item.message?.toLowerCase().includes('comment') ? (
                      <LinearGradient
                        colors={[COLORS.accent, '#FF6B35']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="chatbubble" size={20} color="white" />
                      </LinearGradient>
                    ) : (
                      <LinearGradient
                        colors={[COLORS.success, '#4CC9F0']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="notifications" size={20} color="white" />
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.messageText, !item.read && styles.bold]}>{item.message}</Text>
                    <Text style={styles.time}>{formatTimeAgo(new Date(item.createdAt))}</Text>
                    {/* Friend request actions */}
                    {item.message?.toLowerCase().includes('friend request') && !item.read && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmFriendRequest(item.id)}>
                          <LinearGradient
                            colors={[COLORS.success, '#4CC9F0']}
                            style={styles.actionGradient}
                          >
                            <Ionicons name="checkmark" size={16} color="white" />
                            <Text style={styles.actionText}>Accept</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.declineBtn} onPress={() => handleDeleteFriendRequest(item.id)}>
                          <LinearGradient
                            colors={[COLORS.danger, '#FF6B6B']}
                            style={styles.actionGradient}
                          >
                            <Ionicons name="close" size={16} color="white" />
                            <Text style={styles.actionText}>Decline</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {!item.read && (
                    <View style={styles.unreadDot}>
                      <LinearGradient
                        colors={[COLORS.accent, '#FF6B35']}
                        style={styles.dotGradient}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: COLORS.card,
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
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.background,
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
  markAllBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  markAllText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  unreadCard: {
    shadowColor: COLORS.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: '#FFF8E1',
    borderColor: COLORS.accent,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
  },
  markAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  unreadAvatar: {
    backgroundColor: '#f0f0f0', // Slightly lighter background for unread
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  dotGradient: {
    flex: 1,
    borderRadius: 5,
  },
});