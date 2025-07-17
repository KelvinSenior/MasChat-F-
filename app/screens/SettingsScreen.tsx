import { Entypo, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from '../../constants/ThemeContext';

const settingsOptions = [
  {
    section: "Tools and resources",
    data: [
      { icon: <Ionicons name="lock-closed-outline" size={22} color="#1877f2" />, label: "Privacy Checkup", color: '#1877f2' },
      { icon: <MaterialCommunityIcons name="home-outline" size={22} color="#ff7043" />, label: "Family Center", color: '#ff7043' },
      { icon: <Ionicons name="settings-outline" size={22} color="#5c6bc0" />, label: "Default audience settings", color: '#5c6bc0' },
    ],
  },
  {
    section: "Preferences",
    data: [
      { icon: <Feather name="sliders" size={22} color="#26a69a" />, label: "Content preferences", color: '#26a69a' },
      { icon: <MaterialCommunityIcons name="emoticon-outline" size={22} color="#ffca28" />, label: "Reaction preferences", color: '#ffca28' },
      { icon: <Ionicons name="notifications-outline" size={22} color="#42a5f5" />, label: "Notifications", color: '#42a5f5' },
      { icon: <MaterialCommunityIcons name="account-outline" size={22} color="#ab47bc" />, label: "Accessibility", color: '#ab47bc' },
      { icon: <Entypo name="pin" size={22} color="#66bb6a" />, label: "Tab bar", color: '#66bb6a' },
      { icon: <Ionicons name="globe-outline" size={22} color="#26c6da" />, label: "Language and region", color: '#26c6da' },
      { icon: <Feather name="file" size={22} color="#7e57c2" />, label: "Media", color: '#7e57c2' },
      { icon: <Ionicons name="time-outline" size={22} color="#78909c" />, label: "Your time on Facebook", color: '#78909c' },
      { icon: <Feather name="globe" size={22} color="#8d6e63" />, label: "Browser", color: '#8d6e63' },
      // Dark mode will be rendered separately for toggle functionality
    ],
  },
  {
    section: "Support",
    data: [
      { icon: <Ionicons name="help-circle-outline" size={22} color="#ec407a" />, label: "Help & Support", color: '#ec407a' },
      { icon: <MaterialCommunityIcons name="information-outline" size={22} color="#26a69a" />, label: "Terms and Policies", color: '#26a69a' },
      { icon: <Ionicons name="people-outline" size={22} color="#5c6bc0" />, label: "Community Standards", color: '#5c6bc0' },
    ],
  },
];

export default function SettingsScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Filter options based on search
  const filteredOptions = settingsOptions.map(section => ({
    ...section,
    data: section.data.filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section => section.data.length > 0);

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search settings"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Settings List */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredOptions.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContainer}>
              {section.data.map((option, index) => (
                <React.Fragment key={option.label}>
                  <TouchableOpacity style={styles.optionRow}>
                    <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                      {option.icon}
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                  {index < section.data.length - 1 && <View style={styles.optionDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.optionRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#1877f2' }]}>
                <Ionicons name="person-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.optionLabel}>Personal Information</Text>
            </TouchableOpacity>
            <View style={styles.optionDivider} />
            <TouchableOpacity style={styles.optionRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#1877f2' }]}>
                <Ionicons name="shield-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.optionLabel}>Security</Text>
            </TouchableOpacity>
            <View style={styles.optionDivider} />
            <TouchableOpacity style={styles.optionRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#ec407a' }]}>
                <Ionicons name="log-out" size={22} color="#fff" />
              </View>
              <Text style={styles.optionLabel}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <TouchableOpacity style={styles.optionRow} onPress={toggleTheme}>
          <View style={[styles.iconContainer, { backgroundColor: '#333' }]}> 
            <Ionicons name={theme === 'light' ? 'moon' : 'sunny'} size={22} color="#fff" />
          </View>
          <Text style={styles.optionLabel}>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</Text>
        </TouchableOpacity>
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
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
  headerIcon: { 
    padding: 6,
  },
  headerTitle: { 
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#222",
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: 'sans-serif'
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 24,
    fontFamily: 'sans-serif-medium'
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontFamily: 'sans-serif'
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#f0f2f5",
    marginLeft: 64,
  },
  accountSection: {
    marginTop: 8,
  },
});