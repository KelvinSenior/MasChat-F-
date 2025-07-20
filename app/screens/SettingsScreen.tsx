import { Entypo, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform, Alert } from "react-native";

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const settingsOptions = [
  {
    section: "Privacy & Security",
    data: [
      { icon: <Ionicons name="lock-closed-outline" size={22} color="#0A2463" />, label: "Privacy Settings", route: "/screens/PrivacySettingsScreen" },
      { icon: <Ionicons name="shield-outline" size={22} color="#FF7F11" />, label: "Security Settings", route: "/screens/SecuritySettingsScreen" },
      { icon: <Ionicons name="notifications-outline" size={22} color="#5c6bc0" />, label: "Notification Settings", route: "/screens/NotificationSettingsScreen" },
    ],
  },
  {
    section: "Preferences",
    data: [
      { icon: <Feather name="sliders" size={22} color="#26a69a" />, label: "Content Preferences", route: "/screens/ContentPreferencesScreen" },
      { icon: <MaterialCommunityIcons name="emoticon-outline" size={22} color="#ffca28" />, label: "Reaction preferences" },
      { icon: <MaterialCommunityIcons name="account-outline" size={22} color="#ab47bc" />, label: "Accessibility", route: "/screens/AccessibilitySettingsScreen" },
      { icon: <Entypo name="pin" size={22} color="#66bb6a" />, label: "Tab bar" },
      { icon: <Ionicons name="globe-outline" size={22} color="#26c6da" />, label: "Language and region" },
      { icon: <Feather name="file" size={22} color="#7e57c2" />, label: "Media" },
      { icon: <Ionicons name="time-outline" size={22} color="#78909c" />, label: "Your time on Facebook" },
      { icon: <Feather name="globe" size={22} color="#8d6e63" />, label: "Browser" },
    ],
  },
  {
    section: "Support",
    data: [
      { icon: <Ionicons name="help-circle-outline" size={22} color="#ec407a" />, label: "Help & Support" },
      { icon: <MaterialCommunityIcons name="information-outline" size={22} color="#26a69a" />, label: "Terms and Policies" },
      { icon: <Ionicons name="people-outline" size={22} color="#5c6bc0" />, label: "Community Standards" },
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

  const handleOptionPress = (option: any) => {
    if (option.route) {
      router.push(option.route);
    } else {
      router.push('/screens/ComingSoon');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/home');
          }
        }} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <View style={styles.headerIcon} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search settings"
            placeholderTextColor={COLORS.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Settings List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContainer}>
              {section.data.map((option, index) => (
                <React.Fragment key={option.label}>
                  <TouchableOpacity 
                    style={styles.optionRow}
                    onPress={() => handleOptionPress(option)}
                  >
                    <View style={styles.iconContainer}>
                      {option.icon}
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
                  </TouchableOpacity>
                  {index < section.data.length - 1 && <View style={styles.optionDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.optionLabel}>Personal Information</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.lightText} />
            </TouchableOpacity>
            <View style={styles.optionDivider} />
            <TouchableOpacity style={styles.optionRow} onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: () => router.replace("/login") }
                ]
              );
            }}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out" size={22} color="#ec407a" />
              </View>
              <Text style={[styles.optionLabel, { color: '#ec407a' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    // paddingTop handled inline
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.lightText,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 24,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: '#f0f2f5',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#f0f2f5",
    marginLeft: 64,
  },
});