import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NewStory() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create story</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ marginRight: 18 }}>
            <Ionicons name="camera-outline" size={24} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="person-circle-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Story Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storyOptionsRow}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        <TouchableOpacity style={styles.storyOption}>
          <Ionicons name="musical-notes-outline" size={28} color="#222" />
          <Text style={styles.storyOptionText}>Music</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyOption}>
          <MaterialIcons name="text-fields" size={28} color="#222" />
          <Text style={styles.storyOptionText}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyOption}>
          <Entypo name="infinity" size={28} color="#222" />
          <Text style={styles.storyOptionText}>Boomerang</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyOption}>
          <Ionicons name="sparkles-outline" size={28} color="#222" />
          <Text style={styles.storyOptionText}>AI image</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Camera Roll Dropdown */}
      <View style={styles.cameraRollRow}>
        <Text style={styles.cameraRollText}>Camera roll</Text>
        <Ionicons name="chevron-down" size={18} color="#222" style={{ marginLeft: 4 }} />
        <View style={{ flex: 1 }} />
        <Ionicons name="search" size={20} color="#888" />
      </View>

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
  storyOptionsRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
  },
  storyOption: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  storyOptionText: {
    fontSize: 13,
    color: "#222",
    marginTop: 4,
    fontWeight: "500",
  },
  cameraRollRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  cameraRollText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
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