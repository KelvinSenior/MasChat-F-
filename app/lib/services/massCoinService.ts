import client from '../../api/client';

export interface WalletInfo {
  userId: string;
  walletAddress: string;
  balance: number;
  stakedAmount: number;
  totalEarned: number;
  totalSpent: number;
  walletType: 'CUSTODIAL' | 'EXTERNAL' | 'HYBRID';
  isActive: boolean;
  lastSyncAt?: string;
}

export interface TransactionInfo {
  id: number;
  senderId: string;
  senderName: string;
  senderUsername: string;
  recipientId: string;
  recipientName: string;
  recipientUsername: string;
  amount: number;
  transactionHash: string;
  transactionType: 'P2P_TRANSFER' | 'CONTENT_TIP' | 'GIFT_PURCHASE' | 'MARKETPLACE_PURCHASE' | 'SUBSCRIPTION_PAYMENT' | 'REWARD_DISTRIBUTION' | 'STAKING_REWARD' | 'AIRDROP';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  gasFee?: number;
  usdValue?: number;
  createdAt: string;
  description?: string;
  blockNumber?: number;
}

export interface TransferRequest {
  recipientId: string;
  amount: number;
  description?: string;
  transactionType?: TransactionInfo['transactionType'];
}

export interface StakingRequest {
  amount: number;
  action: 'stake' | 'unstake';
}

export interface UserStats {
  balance: number;
  stakedAmount: number;
  totalEarned: number;
  totalSpent: number;
  transactionCount: number;
  totalSent: number;
  totalReceived: number;
}

export interface PlatformStats {
  totalBalance: number;
  totalStaked: number;
  totalVolume: number;
  totalWallets: number;
  totalTransactions: number;
  massPrice: number;
}

class MassCoinService {
  // Wallet Operations
  async getWallet(): Promise<WalletInfo> {
    try {
      if (!client) {
        throw new Error('API client is not initialized');
      }
      const response = await client.get('/api/masscoin/wallet');
      return response.data;
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error fetching wallet:', error);
      }
      return this.getMockWallet();
    }
  }

  async updateWalletAddress(walletAddress: string): Promise<WalletInfo> {
    try {
      const response = await client.post('/api/masscoin/wallet/address', {
        walletAddress
      });
      return response.data;
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error updating wallet address:', error);
      }
      throw error;
    }
  }

  // Transaction Operations
  async transferMass(request: TransferRequest): Promise<TransactionInfo> {
    try {
      const response = await client.post('/api/masscoin/transfer', request);
      return response.data;
    } catch (error) {
      console.error('Error transferring MASS:', error);
      throw error;
    }
  }

  async tipCreator(postId: string, amount: number, description?: string): Promise<TransactionInfo> {
    try {
      const response = await client.post('/api/masscoin/tip', {
        postId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error tipping creator:', error);
      throw error;
    }
  }

  async rewardUser(userId: string, amount: number, reason: string): Promise<TransactionInfo> {
    try {
      const response = await client.post('/api/masscoin/reward', {
        userId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rewarding user:', error);
      throw error;
    }
  }

  // Staking Operations
  async stakeMass(amount: number): Promise<WalletInfo> {
    try {
      const response = await client.post('/api/masscoin/stake', {
        amount,
        action: 'stake'
      });
      return response.data;
    } catch (error) {
      console.error('Error staking MASS:', error);
      throw error;
    }
  }

  async unstakeMass(amount: number): Promise<WalletInfo> {
    try {
      const response = await client.post('/api/masscoin/unstake', {
        amount,
        action: 'unstake'
      });
      return response.data;
    } catch (error) {
      console.error('Error unstaking MASS:', error);
      throw error;
    }
  }

  // Query Operations
  async getUserTransactions(page: number = 0, size: number = 20): Promise<TransactionInfo[]> {
    try {
      if (!client) {
        throw new Error('API client is not initialized');
      }
      const response = await client.get(`/api/masscoin/transactions?page=${page}&size=${size}`);
      return response.data;
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error fetching transactions:', error);
      }
      return this.getMockTransactions();
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      if (!client) {
        throw new Error('API client is not initialized');
      }
      const response = await client.get('/api/masscoin/stats/user');
      return response.data;
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error fetching user stats:', error);
      }
      return {
        balance: 1000.0,
        stakedAmount: 500.0,
        totalEarned: 2000.0,
        totalSpent: 500.0,
        transactionCount: 15,
        totalSent: 800.0,
        totalReceived: 1200.0
      };
    }
  }

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const response = await client.get('/api/masscoin/stats/platform');
      return response.data;
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error fetching platform stats:', error);
      }
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; version: string }> {
    try {
      const response = await client.get('/api/masscoin/health');
      return response.data;
    } catch (error) {
      console.error('Error checking Mass Coin service health:', error);
      throw error;
    }
  }

  // Utility Methods
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  }

  formatUsdValue(amount: number, massPrice: number = 0.001): string {
    const usdValue = amount * massPrice;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(usdValue);
  }

  getTransactionTypeLabel(type: TransactionInfo['transactionType']): string {
    const labels = {
      P2P_TRANSFER: 'Transfer',
      CONTENT_TIP: 'Tip',
      GIFT_PURCHASE: 'Gift',
      MARKETPLACE_PURCHASE: 'Purchase',
      SUBSCRIPTION_PAYMENT: 'Subscription',
      REWARD_DISTRIBUTION: 'Reward',
      STAKING_REWARD: 'Staking Reward',
      AIRDROP: 'Airdrop'
    };
    return labels[type] || type;
  }

  getStatusColor(status: TransactionInfo['status']): string {
    const colors = {
      PENDING: '#FFA500',
      CONFIRMED: '#4CAF50',
      FAILED: '#F44336',
      CANCELLED: '#9E9E9E'
    };
    return colors[status] || '#9E9E9E';
  }

  getStatusLabel(status: TransactionInfo['status']): string {
    const labels = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      FAILED: 'Failed',
      CANCELLED: 'Cancelled'
    };
    return labels[status] || status;
  }

  // Mock data for development/testing
  getMockWallet(): WalletInfo {
    return {
      userId: 'mock-user',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      balance: 1000.0,
      stakedAmount: 500.0,
      totalEarned: 2000.0,
      totalSpent: 500.0,
      walletType: 'CUSTODIAL',
      isActive: true,
      lastSyncAt: new Date().toISOString()
    };
  }

  getMockTransactions(): TransactionInfo[] {
    return [
      {
        id: 1,
        senderId: 'user1',
        senderName: 'John Doe',
        senderUsername: 'johndoe',
        recipientId: 'user2',
        recipientName: 'Jane Smith',
        recipientUsername: 'janesmith',
        amount: 100.0,
        transactionHash: '0xabc123def456',
        transactionType: 'P2P_TRANSFER',
        status: 'CONFIRMED',
        gasFee: 0.001,
        usdValue: 0.1,
        createdAt: new Date().toISOString(),
        description: 'Payment for services'
      },
      {
        id: 2,
        senderId: 'system',
        senderName: 'MasChat System',
        senderUsername: 'system',
        recipientId: 'user1',
        recipientName: 'John Doe',
        recipientUsername: 'johndoe',
        amount: 50.0,
        transactionHash: '0xdef456abc789',
        transactionType: 'REWARD_DISTRIBUTION',
        status: 'CONFIRMED',
        gasFee: 0.001,
        usdValue: 0.05,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        description: 'Daily reward for engagement'
      }
    ];
  }
}

export const massCoinService = new MassCoinService(); 