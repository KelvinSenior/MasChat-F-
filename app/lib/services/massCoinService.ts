import client from '../../api/client';

export interface WalletInfo {
  id: number;
  userId: number;
  walletAddress: string;
  balance: number;
  stakedAmount: number;
  totalEarned: number;
  totalSpent: number;
  walletType: string;
  isActive: boolean;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRequest {
  recipientId: number;
  amount: number;
  message?: string;
  contextType: 'POST' | 'REEL' | 'CHAT' | 'DIRECT' | 'MASS_COIN_SECTION';
  contextId?: string;
  transactionType?: 'P2P_TRANSFER' | 'CONTENT_TIP' | 'GIFT_PURCHASE' | 'MARKETPLACE_PURCHASE' | 'SUBSCRIPTION_PAYMENT' | 'REWARD_DISTRIBUTION' | 'STAKING_REWARD' | 'AIRDROP';
}

export interface TransferRequestInfo {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  recipientId: number;
  recipientName: string;
  recipientAvatar?: string;
  amount: number;
  message?: string;
  contextType: string;
  contextId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
}

export interface TransactionInfo {
  id: number;
  senderId?: number;
  senderName: string;
  senderAvatar?: string;
  recipientId: number;
  recipientName: string;
  recipientAvatar?: string;
  amount: number;
  transactionHash?: string;
  transactionType: string;
  status: string;
  gasFee?: number;
  usdValue?: number;
  description?: string;
  createdAt: string;
}

export interface UserStats {
  totalTransactions: number;
  totalVolume: number;
  averageTransactionAmount: number;
  totalTipsReceived: number;
  totalTipsAmount: number;
  totalTipsSent: number;
  totalTipsSentAmount: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalWallets: number;
  totalCirculatingSupply: number;
  totalStakedAmount: number;
  totalTransactions: number;
  totalTransactionVolume: number;
}

class MassCoinService {
  // Wallet operations
  async getWallet(userId: number): Promise<WalletInfo> {
    try {
      const response = await client.get(`/api/masscoin/wallet?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  async updateWalletAddress(userId: number, address: string): Promise<WalletInfo> {
    try {
      const response = await client.post(`/api/masscoin/wallet/address?userId=${userId}`, {
        address: address
      });
      return response.data;
    } catch (error) {
      console.error('Error updating wallet address:', error);
      throw error;
    }
  }

  // Transfer request operations
  async createTransferRequest(senderId: number, request: TransferRequest): Promise<TransferRequestInfo> {
    try {
      const response = await client.post(`/api/masscoin/transfer-request?senderId=${senderId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error creating transfer request:', error);
      throw error;
    }
  }

  async approveTransferRequest(requestId: number, recipientId: number): Promise<TransactionInfo> {
    try {
      const response = await client.post(`/api/masscoin/transfer-request/${requestId}/approve?recipientId=${recipientId}`);
      return response.data;
    } catch (error) {
      console.error('Error approving transfer request:', error);
      throw error;
    }
  }

  async rejectTransferRequest(requestId: number, recipientId: number): Promise<void> {
    try {
      await client.post(`/api/masscoin/transfer-request/${requestId}/reject?recipientId=${recipientId}`);
    } catch (error) {
      console.error('Error rejecting transfer request:', error);
      throw error;
    }
  }

  async getTransferRequests(userId: number): Promise<TransferRequestInfo[]> {
    try {
      const response = await client.get(`/api/masscoin/transfer-requests?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfer requests:', error);
      throw error;
    }
  }

  async getPendingTransferRequestsCount(userId: number): Promise<number> {
    try {
      const response = await client.get(`/api/masscoin/transfer-requests/pending-count?userId=${userId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching pending transfer requests count:', error);
      throw error;
    }
  }

  // Direct transfer operations
  async transferMass(senderId: number, request: TransferRequest): Promise<TransactionInfo> {
    try {
      const response = await client.post(`/api/masscoin/transfer?senderId=${senderId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error transferring mass coins:', error);
      throw error;
    }
  }

  // Tip operations
  async tipCreator(senderId: number, postId: string, amount: number, description?: string): Promise<TransactionInfo> {
    try {
      const params = new URLSearchParams({
        senderId: senderId.toString(),
        postId: postId,
        amount: amount.toString()
      });
      if (description) {
        params.append('description', description);
      }
      
      const response = await client.post(`/api/masscoin/tip?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error tipping creator:', error);
      throw error;
    }
  }

  // Reward operations
  async rewardUser(userId: number, amount: number, reason: string): Promise<TransactionInfo> {
    try {
      const response = await client.post(`/api/masscoin/reward?userId=${userId}&amount=${amount}&reason=${encodeURIComponent(reason)}`);
      return response.data;
    } catch (error) {
      console.error('Error rewarding user:', error);
      throw error;
    }
  }

  // Staking operations
  async stakeMass(userId: number, amount: number): Promise<WalletInfo> {
    try {
      const response = await client.post(`/api/masscoin/stake?userId=${userId}&amount=${amount}`);
      return response.data;
    } catch (error) {
      console.error('Error staking mass coins:', error);
      throw error;
    }
  }

  async unstakeMass(userId: number, amount: number): Promise<WalletInfo> {
    try {
      const response = await client.post(`/api/masscoin/unstake?userId=${userId}&amount=${amount}`);
      return response.data;
    } catch (error) {
      console.error('Error unstaking mass coins:', error);
      throw error;
    }
  }

  // Transaction operations
  async getUserTransactions(userId: number, page: number = 0, size: number = 10): Promise<{ content: TransactionInfo[], totalElements: number, totalPages: number }> {
    try {
      const response = await client.get(`/api/masscoin/transactions?userId=${userId}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await client.get('/api/masscoin/health');
      return response.data;
    } catch (error) {
      console.error('Error checking mass coin service health:', error);
      throw error;
    }
  }

  // Utility methods
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  }

  formatUsdValue(amount: number): string {
    // Mock USD value - in real app, this would fetch from an API
    const usdRate = 0.01; // 1 Mass Coin = $0.01
    const usdValue = amount * usdRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(usdValue);
  }

  getTransactionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'P2P_TRANSFER': 'Peer to Peer',
      'CONTENT_TIP': 'Content Tip',
      'GIFT_PURCHASE': 'Gift Purchase',
      'MARKETPLACE_PURCHASE': 'Marketplace',
      'SUBSCRIPTION_PAYMENT': 'Subscription',
      'REWARD_DISTRIBUTION': 'Reward',
      'STAKING_REWARD': 'Staking Reward',
      'AIRDROP': 'Airdrop'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'FAILED': 'Failed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': '#fbbf24',
      'CONFIRMED': '#22c55e',
      'FAILED': '#ef4444',
      'CANCELLED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  // Mock data for development
  getMockWallet(): WalletInfo {
    return {
      id: 1,
      userId: 1,
      walletAddress: 'MC1234567890ABCDEF1234567890ABCDEF',
      balance: 1000.0,
      stakedAmount: 0.0,
      totalEarned: 1000.0,
      totalSpent: 0.0,
      walletType: 'CUSTODIAL',
      isActive: true,
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getMockTransactions(): TransactionInfo[] {
    return [
      {
        id: 1,
        senderId: undefined,
        senderName: 'System',
        recipientId: 1,
        recipientName: 'John Doe',
        amount: 1000.0,
        transactionType: 'AIRDROP',
        status: 'CONFIRMED',
        description: 'Welcome bonus - 1000 Mass Coins',
        createdAt: new Date().toISOString()
      }
    ];
  }
}

export const massCoinService = new MassCoinService(); 