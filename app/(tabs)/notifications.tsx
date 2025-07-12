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
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => router.push("../screens/SearchScreen")}
          style={styles.iconBtn}
        >
          <LinearGradient 
            colors={['#4facfe', '#00f2fe']} 
            style={styles.iconBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="search" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>New</Text>
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              {item.isReport ? (
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.reportIconWrap}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome name="flag" size={20} color="white" />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#a18cd1', '#fbc2eb']}
                  style={styles.avatarContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image
                    source={
                      typeof item.avatar === "string"
                        ? { uri: item.avatar }
                        : item.avatar
                    }
                    style={styles.avatar}
                  />
                </LinearGradient>
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
                <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
              </TouchableOpacity>
            </View>
            {item.actions && (
              <View style={styles.actionsRow}>
                {item.actions.map((action) => (
                  <TouchableOpacity
                    key={action}
                    style={styles.actionBtn}
                  >
                    <LinearGradient
                      colors={
                        action === "Confirm" || action === "Remix" 
                          ? ['#4facfe', '#00f2fe'] 
                          : ['#e4e6eb', '#d8dadf']
                      }
                      style={styles.actionBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={[
                        styles.actionText,
                        action === "Confirm" || action === "Remix"
                          ? styles.primaryText
                          : styles.secondaryText
                      ]}>
                        {action}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  iconBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  iconBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scroll: {
    flex: 1,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 16,
    fontFamily: 'sans-serif-medium'
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
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
    padding: 2
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'white'
  },
  reportIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageText: {
    fontSize: 15,
    color: "#222",
    marginBottom: 4,
    lineHeight: 20,
    fontFamily: 'sans-serif'
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
    fontFamily: 'sans-serif-medium'
  },
  mutual: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontFamily: 'sans-serif'
  },
  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    fontFamily: 'sans-serif'
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: 'flex-end',
    gap: 8
  },
  actionBtn: {
    borderRadius: 8,
    overflow: 'hidden'
  },
  actionBtnGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionText: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#222",
  },
});