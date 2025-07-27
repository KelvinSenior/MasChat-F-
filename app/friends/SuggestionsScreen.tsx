import { Ionicons } from "@expo/vector-icons";
import ModernHeader from '../components/ModernHeader';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SuggestionCard from './SuggestionCard';
import { useAuth } from '../context/AuthContext';
import { friendService } from '../lib/services/friendService';
import { useFocusEffect } from '@react-navigation/native';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type Suggestion = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function SuggestionsScreen() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  const fetchSuggestions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await friendService.getSuggestions(user.id);
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchSuggestions();
    }, [user?.id])
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }
    if (suggestions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>No suggestions available</Text>
          <Text style={styles.emptySubtext}>We'll show you people you may know based on your connections</Text>
        </View>
      );
    }
    return suggestions.map(sug => (
      <SuggestionCard key={sug.id} suggestion={sug} />
    ));
  };

  return (
    <View style={styles.container}>
      <ModernHeader
        title="Suggestions"
        showBackButton={true}
        onBackPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/menu');
          }
        }}
        rightIcon="refresh"
        onRightPress={() => {}}
      />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          People you may know
        </Text>
        <Text style={styles.sectionSubtitle}>
          {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
        </Text>
      </View>

      {/* Suggestions List */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
