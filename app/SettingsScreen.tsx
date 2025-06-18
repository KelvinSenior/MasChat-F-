import { Entypo, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const settingsOptions = [
  {
    section: "Tools and resources",
    data: [
      { icon: <Ionicons name="lock-closed-outline" size={22} />, label: "Privacy Checkup" },
      { icon: <MaterialCommunityIcons name="home-outline" size={22} />, label: "Family Center" },
      { icon: <Ionicons name="settings-outline" size={22} />, label: "Default audience settings" },
    ],
  },
  {
    section: "Preferences",
    data: [
      { icon: <Feather name="sliders" size={22} />, label: "Content preferences" },
      { icon: <MaterialCommunityIcons name="emoticon-outline" size={22} />, label: "Reaction preferences" },
      { icon: <Ionicons name="notifications-outline" size={22} />, label: "Notifications" },
      { icon: <MaterialCommunityIcons name="account-outline" size={22} />, label: "Accessibility" },
      { icon: <Entypo name="pin" size={22} />, label: "Tab bar" },
      { icon: <Ionicons name="globe-outline" size={22} />, label: "Language and region" },
      { icon: <Feather name="file" size={22} />, label: "Media" },
      { icon: <Ionicons name="time-outline" size={22} />, label: "Your time on Facebook" },
      { icon: <Feather name="globe" size={22} />, label: "Browser" },
      { icon: <Ionicons name="moon-outline" size={22} />, label: "Dark mode" },
    ],
  },
];

export default function SettingsScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Filter options based on search
  const filteredOptions = settingsOptions.map(section => ({
    ...section,
    data: section.data.filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section => section.data.length > 0);

  return (
    <View style={styles.container}>
      {/* Header with back and search */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & privacy</Text>
        <Ionicons name="search" size={24} color="#000" style={styles.headerSearchIcon} />
      </View>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search settings"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Settings List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {filteredOptions.map(section => (
          <View key={section.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.data.map(option => (
              <TouchableOpacity key={option.label} style={styles.optionRow}>
                {option.icon}
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.sectionDivider} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  headerIcon: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: "bold", flex: 1, color: "#000" },
  headerSearchIcon: { marginLeft: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    color: "#000",
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 18,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionLabel: {
    fontSize: 16,
    color: "#111",
    marginLeft: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 18,
    marginVertical: 6,
  },
});