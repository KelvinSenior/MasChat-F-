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
  useColorScheme
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { massCoinService, WalletInfo, TransactionInfo, UserStats } from '../lib/services/massCoinService';
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

export default function MassCoinDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'staking'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData, statsData] = await Promise.all([
        massCoinService.getWallet(),
        massCoinService.getUserTransactions(0, 10),
        massCoinService.getUserStats()
      ]);
      
      setWallet(walletData);
      setTransactions(transactionsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading Mass Coin data:', error);
      // Use mock data for development
      setWallet(massCoinService.getMockWallet());
      setTransactions(massCoinService.getMockTransactions());
      setUserStats({
        balance: 1000.0,
        stakedAmount: 500.0,
        totalEarned: 2000.0,
        totalSpent: 500.0,
        transactionCount: 15,
        totalSent: 800.0,
        totalReceived: 1200.0
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendMass = () => {
    router.push('/screens/SendMassScreen');
  };

  const handleReceiveMass = () => {
    Alert.alert(
      'Receive MASS',
      `Your wallet address:\n${wallet?.walletAddress || 'Loading...'}`,
      [
        { text: 'Copy Address', onPress: () => {/* Copy to clipboard */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleStake = () => {
    router.push('/screens/StakingScreen');
  };

  const handleViewTransactions = () => {
    setActiveTab('transactions');
  };

  const formatAmount = (amount: number) => {
    return massCoinService.formatAmount(amount);
  };

  const formatUsdValue = (amount: number) => {
    return massCoinService.formatUsdValue(amount);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Balance Card */}
      <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.balanceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <View style={styles.coinIconContainer}>
              <MaterialIcons name="monetization-on" size={32} color={colors.gold} />
            </View>
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {wallet ? formatAmount(wallet.balance + wallet.stakedAmount) : '0.00'} MASS
          </Text>
          <Text style={styles.balanceUsd}>
            ≈ {wallet ? formatUsdValue(wallet.balance + wallet.stakedAmount) : '$0.00'}
          </Text>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleSendMass}>
          <Ionicons name="send" size={24} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Send</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleReceiveMass}>
          <Ionicons name="download" size={24} color={colors.accent} />
          <Text style={[styles.actionText, { color: colors.text }]}>Receive</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleStake}>
          <FontAwesome name="lock" size={24} color={colors.success} />
          <Text style={[styles.actionText, { color: colors.text }]}>Stake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleViewTransactions}>
          <Ionicons name="list" size={24} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.text }]}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statHeader}>
            <Ionicons name="wallet" size={20} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.lightText }]}>Available</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {wallet ? formatAmount(wallet.balance) : '0.00'} MASS
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={styles.statHeader}>
            <FontAwesome name="lock" size={20} color={colors.success} />
            <Text style={[styles.statLabel, { color: colors.lightText }]}>Staked</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {wallet ? formatAmount(wallet.stakedAmount) : '0.00'} MASS
          </Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.recentTransactions}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleViewTransactions}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.slice(0, 3).map((transaction) => (
          <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: colors.card }]}>
            <View style={styles.transactionIcon}>
              <Ionicons 
                name={transaction.transactionType === 'P2P_TRANSFER' ? 'swap-horizontal' : 'gift'} 
                size={20} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={[styles.transactionTitle, { color: colors.text }]}>
                {massCoinService.getTransactionTypeLabel(transaction.transactionType)}
              </Text>
              <Text style={[styles.transactionSubtitle, { color: colors.lightText }]}>
                {transaction.description || 'No description'}
              </Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[styles.amountText, { color: colors.text }]}>
                {transaction.senderId === user?.id ? '-' : '+'}{formatAmount(transaction.amount)}
              </Text>
              <Text style={[styles.amountUsd, { color: colors.lightText }]}>
                {formatUsdValue(transaction.amount)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.tabContent}>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: colors.card }]}>
          <View style={styles.transactionIcon}>
            <Ionicons 
              name={transaction.transactionType === 'P2P_TRANSFER' ? 'swap-horizontal' : 'gift'} 
              size={20} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionTitle, { color: colors.text }]}>
              {massCoinService.getTransactionTypeLabel(transaction.transactionType)}
            </Text>
            <Text style={[styles.transactionSubtitle, { color: colors.lightText }]}>
              {transaction.senderId === user?.id ? `To ${transaction.recipientName}` : `From ${transaction.senderName}`}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.lightText }]}>
              {new Date(transaction.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[styles.amountText, { color: colors.text }]}>
              {transaction.senderId === user?.id ? '-' : '+'}{formatAmount(transaction.amount)}
            </Text>
            <Text style={[styles.amountUsd, { color: colors.lightText }]}>
              {formatUsdValue(transaction.amount)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: massCoinService.getStatusColor(transaction.status) }]}>
              <Text style={styles.statusText}>
                {massCoinService.getStatusLabel(transaction.status)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderStaking = () => (
    <View style={styles.tabContent}>
      <View style={[styles.stakingCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.stakingTitle, { color: colors.text }]}>Staking Rewards</Text>
        <Text style={[styles.stakingSubtitle, { color: colors.lightText }]}>
          Earn up to 15% APY by staking your MASS tokens
        </Text>
        
        <View style={styles.stakingStats}>
          <View style={styles.stakingStat}>
            <Text style={[styles.stakingStatValue, { color: colors.text }]}>
              {wallet ? formatAmount(wallet.stakedAmount) : '0.00'}
            </Text>
            <Text style={[styles.stakingStatLabel, { color: colors.lightText }]}>Staked Amount</Text>
          </View>
          <View style={styles.stakingStat}>
            <Text style={[styles.stakingStatValue, { color: colors.success }]}>15%</Text>
            <Text style={[styles.stakingStatLabel, { color: colors.lightText }]}>APY</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.stakeButton} onPress={handleStake}>
          <LinearGradient
            colors={[colors.success, '#2E8B57']}
            style={styles.stakeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.stakeButtonText}>Manage Staking</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader
          title="Mass Coin"
          showBackButton={true}
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.lightText }]}>Loading wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader
        title="Mass Coin"
        showBackButton={true}
        onBack={() => router.back()}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'overview' ? 'white' : colors.text }]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'transactions' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'transactions' ? 'white' : colors.text }]}>
              Transactions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'staking' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('staking')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'staking' ? 'white' : colors.text }]}>
              Staking
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'staking' && renderStaking()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  balanceUsd: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentTransactions: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  amountUsd: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  stakingCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stakingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stakingSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  stakingStats: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 24,
  },
  stakingStat: {
    alignItems: 'center',
  },
  stakingStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stakingStatLabel: {
    fontSize: 12,
  },
  stakeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  stakeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  stakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 