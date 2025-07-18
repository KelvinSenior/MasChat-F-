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

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const notifications = [
  {
    id: 1,
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    name: "Prophetic Coomson",
    message: "sent you a friend request.",
    mutual: "Wesley Oduro and 6 other mutual friends",
    actions: ["Confirm", "Delete"],
    isNew: true,
  },
  {
    id: 2,
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    name: "Prophetic Coomson",
    message: "sent you a friend request that you haven't responded to yet.",
    time: "1w",
    isNew: true,
  },
  {
    id: 3,
    name: "Akanakoji Kyojiro",
    message: "We have an update about your report of Akanakoji Kyojiro.",
    time: "5d",
    isNew: true,
    isReport: true,
  },
  {
    id: 4,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "",
    message: "Blast to the past with your post from December 2023.",
    time: "9h",
    isNew: true,
    isBlast: true,
  },
  {
    id: 5,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "",
    message:
      "Blast to the past with your post from December 2023 with Dnaiel Yeboah, Cecilia Hodey and 12 others: '😲😲'...",
    time: "2d",
    isNew: true,
    isBlast: true,
  },
  {
    id: 6,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "",
    message: "Blast to the past with your post from August 2020.",
    time: "1d",
    isNew: true,
    isBlast: true,
  },
  {
    id: 7,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "",
    message: "Remember what you were up to in April 2024.",
    time: "5d",
    actions: ["Remix", "Dismiss"],
    isNew: true,
    isBlast: true,
  },
];

export default function Notifications() {
  const router = useRouter();

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
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              {item.isReport ? (
                <View style={[styles.avatarContainer, { backgroundColor: COLORS.primary }]}>
                  <FontAwesome name="flag" size={20} color="white" />
                </View>
              ) : (
                <View style={styles.avatarContainer}>
                  <Image
                    source={
                      typeof item.avatar === "string"
                        ? { uri: item.avatar }
                        : item.avatar
                    }
                    style={styles.avatar}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.messageText}>
                  {item.name ? (
                    <Text style={styles.bold}>{item.name} </Text>
                  ) : null}
                  {item.message}
                </Text>
                {item.mutual && (
                  <Text style={styles.mutual}>{item.mutual}</Text>
                )}
                {item.time && <Text style={styles.time}>{item.time}</Text>}
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.lightText} />
              </TouchableOpacity>
            </View>
            {item.actions && (
              <View style={styles.actionsRow}>
                {item.actions.map((action) => (
                  <TouchableOpacity
                    key={action}
                    style={[
                      styles.actionBtn,
                      (action === "Confirm" || action === "Remix") ? styles.primaryAction : styles.secondaryAction
                    ]}
                  >
                    <Text style={[
                      styles.actionText,
                      (action === "Confirm" || action === "Remix") ? styles.primaryText : styles.secondaryText
                    ]}>
                      {action}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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