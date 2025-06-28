import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const [showAvatar, setShowAvatar] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 26 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Profile Picture */}
      <Text style={styles.sectionTitle}>Profile picture <Text style={styles.editLink}>Edit</Text></Text>
      <Image
        source={{ uri: "https://i.imgur.com/6XbK6bE.jpg" }}
        style={styles.profilePic}
      />

      {/* Avatar */}
      <Text style={styles.sectionTitle}>Avatar <Text style={styles.editLink}>Edit</Text></Text>
      <Image
        source={{ uri: "https://i.imgur.com/2nCt3Sbl.jpg" }}
        style={styles.avatarImg}
      />
      <View style={styles.avatarRow}>
        <Text style={styles.avatarLabel}>Show on profile <Ionicons name="information-circle-outline" size={14} color="#888" /></Text>
        <Switch
          value={showAvatar}
          onValueChange={setShowAvatar}
          thumbColor={showAvatar ? "#1877f2" : "#ccc"}
        />
      </View>
      <Text style={styles.avatarInfo}>
        Your animated avatar is displayed when you swipe your profile picture.
      </Text>

      {/* Cover Photo */}
      <Text style={styles.sectionTitle}>Cover photo <Text style={styles.editLink}>Edit</Text></Text>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" }}
        style={styles.coverPhoto}
      />

      {/* Bio */}
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.editLink}>Edit</Text>
      </View>
      <Text style={styles.bioText}>Progressing is an action not a caption</Text>

      {/* Details */}
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.editLink}>Edit</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="information-circle-outline" size={18} color="#222" />
        <Text style={styles.detailText}>Profile · Just for fun</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons name="work-outline" size={18} color="#222" />
        <Text style={styles.detailText}>Works at Student</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons name="work-outline" size={18} color="#222" />
        <Text style={styles.detailText}>Works at Self Employed Entreprenur</Text>
      </View>
      <View style={styles.detailRow}>
        <FontAwesome5 name="university" size={16} color="#222" />
        <Text style={styles.detailText}>Studied at Harvard University</Text>
      </View>
      <View style={styles.detailRow}>
        <FontAwesome5 name="school" size={16} color="#222" />
        <Text style={styles.detailText}>Went to Presbyterian Boys Secondary School (Presec Legon)</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="home-outline" size={18} color="#bbb" />
        <Text style={[styles.detailText, { color: "#bbb" }]}>Current City</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={18} color="#bbb" />
        <Text style={[styles.detailText, { color: "#bbb" }]}>Hometown</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="heart-outline" size={18} color="#bbb" />
        <Text style={[styles.detailText, { color: "#bbb" }]}>Relationship Status</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginTop: 22,
    marginBottom: 8,
    color: "#222",
  },
  editLink: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginBottom: 18,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  avatarLabel: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  avatarInfo: {
    fontSize: 12,
    color: "#888",
    marginLeft: 16,
    marginBottom: 12,
  },
  coverPhoto: {
    width: "92%",
    height: 120,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 18,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  bioText: {
    fontSize: 15,
    color: "#222",
    marginLeft: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#222",
  },
});