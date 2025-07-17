import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NewReel() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create reel</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Reel Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.optionsRow}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 80 }}
      >
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <Ionicons name="camera-outline" size={28} color="#222" />
          <Text style={styles.optionText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <Ionicons name="musical-notes-outline" size={28} color="#222" />
          <Text style={styles.optionText}>Music</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <MaterialIcons name="filter-none" size={28} color="#222" />
          <Text style={styles.optionText}>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <Ionicons name="play-circle-outline" size={28} color="#222" />
          <Text style={styles.optionText}>Your content</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/ComingSoon')}>
          <FontAwesome5 name="bookmark" size={24} color="#222" />
          <Text style={styles.optionText}>Saved</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Manage Access */}
      <View style={styles.manageRow}>
        <Text style={styles.manageText}>
          You ve allowed access to select photos. You can add more or allow access to all photos.
        </Text>
        <TouchableOpacity>
          <Text style={styles.manageLink}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* See All Photos */}
      <TouchableOpacity style={styles.seeAllPhotosBtn}>
        <Ionicons name="image-outline" size={32} color="#1877f2" />
        <Text style={styles.seeAllPhotosText}>See all photos</Text>
      </TouchableOpacity>
    </View>
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
  optionsRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  optionText: {
    fontSize: 13,
    color: "#222",
    marginTop: 4,
    fontWeight: "500",
  },
  manageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  manageText: {
    flex: 1,
    fontSize: 12,
    color: "#888",
  },
  manageLink: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 8,
  },
  seeAllPhotosBtn: {
    marginTop: 24,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 24,
  },
  seeAllPhotosText: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 6,
  },
});