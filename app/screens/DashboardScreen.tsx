import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  useColorScheme,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ModernHeader from '../../components/ModernHeader';

const { width } = Dimensions.get('window');

// Color Palette
const COLORS = {
  light: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    lightText: '#6C757D',
    border: '#E9ECEF',
    success: '#4CC9F0',
    dark: '#1A1A2E',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E',
    card: '#2D2D44',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',
    success: '#4CC9F0',
    dark: '#1A1A2E',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
};

interface DashboardStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followers: number;
  following: number;
  profileViews: number;
  engagementRate: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'like' | 'comment' | 'follow' | 'mention';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activity'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for development
      setStats({
        totalPosts: 45,
        totalLikes: 1234,
        totalComments: 567,
        totalShares: 89,
        followers: 1234,
        following: 567,
        profileViews: 8901,
        engagementRate: 8.5,
        weeklyGrowth: 12.3,
        monthlyGrowth: 23.7
      });

      setRecentActivity([
        {
          id: '1',
          type: 'post',
          title: 'New Post Created',
          description: 'Your post "Amazing sunset!" received 23 likes',
          timestamp: '2 hours ago',
          icon: 'document-text',
          color: colors.primary
        },
        {
          id: '2',
          type: 'like',
          title: 'Post Liked',
          description: 'John Doe liked your post',
          timestamp: '4 hours ago',
          icon: 'heart',
          color: '#FF6B6B'
        },
        {
          id: '3',
          type: 'comment',
          title: 'New Comment',
          description: 'Jane Smith commented on your post',
          timestamp: '6 hours ago',
          icon: 'chatbubble',
          color: colors.accent
        },
        {
          id: '4',
          type: 'follow',
          title: 'New Follower',
          description: 'Mike Johnson started following you',
          timestamp: '1 day ago',
          icon: 'person-add',
          color: colors.success
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.statGradient}
          >
            <MaterialIcons name="post-add" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.totalPosts || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Posts</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.statGradient}
          >
            <MaterialIcons name="favorite" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.totalLikes || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Likes</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.accent, '#FFA366']}
            style={styles.statGradient}
          >
            <MaterialIcons name="chat" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.totalComments || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Comments</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.success, '#66D9FF']}
            style={styles.statGradient}
          >
            <MaterialIcons name="share" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.totalShares || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Shares</Text>
        </View>
      </View>

      {/* Growth Metrics */}
      <View style={[styles.growthCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Metrics</Text>
        <View style={styles.growthRow}>
          <View style={styles.growthItem}>
            <Text style={[styles.growthNumber, { color: colors.success }]}>+{stats?.weeklyGrowth || 0}%</Text>
            <Text style={[styles.growthLabel, { color: colors.lightText }]}>This Week</Text>
          </View>
          <View style={styles.growthItem}>
            <Text style={[styles.growthNumber, { color: colors.primary }]}>+{stats?.monthlyGrowth || 0}%</Text>
            <Text style={[styles.growthLabel, { color: colors.lightText }]}>This Month</Text>
          </View>
          <View style={styles.growthItem}>
            <Text style={[styles.growthNumber, { color: colors.accent }]}>{stats?.engagementRate || 0}%</Text>
            <Text style={[styles.growthLabel, { color: colors.lightText }]}>Engagement</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.quickActionsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(create)/newPost')}
          >
            <MaterialIcons name="post-add" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>New Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(create)/newStory')}
          >
            <MaterialIcons name="add-circle" size={24} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>New Story</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(create)/newReel')}
          >
            <MaterialIcons name="video-library" size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>New Reel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/screens/SearchScreen')}
          >
            <MaterialIcons name="search" size={24} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Analytics</Text>
        
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsNumber, { color: colors.primary }]}>{stats?.followers || 0}</Text>
            <Text style={[styles.analyticsLabel, { color: colors.lightText }]}>Followers</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsNumber, { color: colors.accent }]}>{stats?.following || 0}</Text>
            <Text style={[styles.analyticsLabel, { color: colors.lightText }]}>Following</Text>
          </View>
        </View>

        <View style={styles.analyticsRow}>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsNumber, { color: colors.success }]}>{stats?.profileViews || 0}</Text>
            <Text style={[styles.analyticsLabel, { color: colors.lightText }]}>Profile Views</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={[styles.analyticsNumber, { color: colors.gold }]}>{stats?.engagementRate || 0}%</Text>
            <Text style={[styles.analyticsLabel, { color: colors.lightText }]}>Engagement Rate</Text>
          </View>
        </View>
      </View>

      {/* Chart Placeholder */}
      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Engagement Trend</Text>
        <View style={[styles.chartPlaceholder, { backgroundColor: colors.border }]}>
          <MaterialIcons name="insert-chart" size={48} color={colors.lightText} />
          <Text style={[styles.chartText, { color: colors.lightText }]}>Chart coming soon</Text>
        </View>
      </View>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.tabContent}>
      <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
              <Ionicons name={activity.icon as any} size={16} color="white" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
              <Text style={[styles.activityDescription, { color: colors.lightText }]}>{activity.description}</Text>
              <Text style={[styles.activityTime, { color: colors.lightText }]}>{activity.timestamp}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Dashboard" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Dashboard" showBackButton={true} />
      
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'overview' ? colors.primary : colors.lightText }]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'analytics' ? colors.primary : colors.lightText }]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'activity' ? colors.primary : colors.lightText }]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'activity' && renderActivity()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  growthCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  growthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  growthItem: {
    alignItems: 'center',
    flex: 1,
  },
  growthNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  growthLabel: {
    fontSize: 12,
  },
  quickActionsCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  analyticsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
  },
  chartCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    marginTop: 8,
    fontSize: 14,
  },
  activityCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
  },
}); 