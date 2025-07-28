import client from '../../api/client';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  notificationType: 'MESSAGE' | 'FRIEND_REQUEST' | 'POST_LIKE' | 'POST_COMMENT' | 'REEL_LIKE' | 'REEL_COMMENT' | 'MASS_COIN_TRANSFER_REQUEST' | 'MASS_COIN_TRANSFER_APPROVED' | 'MASS_COIN_TRANSFER_REJECTED' | 'MASS_COIN_RECEIVED' | 'MASS_COIN_SENT' | 'SYSTEM_MESSAGE';
  relatedId?: string;
  relatedType?: string;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  read: boolean;
  deleted: boolean;
  createdAt: string;
  readAt?: string;
  deletedAt?: string;
}

export interface NotificationPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class NotificationService {
  // Get notifications for a user
  async getNotifications(userId: number, page: number = 0, size: number = 20): Promise<NotificationPage> {
    try {
      const response = await client.get(`/api/notifications?userId=${userId}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const response = await client.get(`/api/notifications/unread-count?userId=${userId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Get unread notifications
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await client.get(`/api/notifications/unread?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await client.post(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: number[]): Promise<void> {
    try {
      await client.post('/api/notifications/mark-read', {
        notificationIds: notificationIds
      });
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await client.post(`/api/notifications/mark-all-read?userId=${userId}`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await client.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete multiple notifications
  async deleteMultipleNotifications(notificationIds: number[]): Promise<void> {
    try {
      await client.delete('/api/notifications/delete-multiple', {
        data: {
          notificationIds: notificationIds
        }
      });
    } catch (error) {
      console.error('Error deleting multiple notifications:', error);
      throw error;
    }
  }

  // Get notifications by type
  async getNotificationsByType(userId: number, notificationType: Notification['notificationType']): Promise<Notification[]> {
    try {
      const response = await client.get(`/api/notifications/by-type?userId=${userId}&notificationType=${notificationType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }
  }

  // Get Mass Coin related notifications
  async getMassCoinNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await client.get(`/api/notifications/masscoin?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Mass Coin notifications:', error);
      throw error;
    }
  }

  // Get recent notifications (last 24 hours)
  async getRecentNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await client.get(`/api/notifications/recent?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw error;
    }
  }

  // Get notifications by date range
  async getNotificationsByDateRange(userId: number, startDate: string, endDate: string): Promise<Notification[]> {
    try {
      const response = await client.get(`/api/notifications/by-date-range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by date range:', error);
      throw error;
    }
  }

  // Create notification (for testing or admin use)
  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    try {
      const response = await client.post('/api/notifications/create', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await client.get('/api/notifications/health');
      return response.data;
    } catch (error) {
      console.error('Error checking notification service health:', error);
      throw error;
    }
  }

  // Utility methods
  formatNotificationTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }

  getNotificationIcon(type: Notification['notificationType']): string {
    const icons: { [key in Notification['notificationType']]: string } = {
      'MESSAGE': 'chatbubble',
      'FRIEND_REQUEST': 'person-add',
      'POST_LIKE': 'heart',
      'POST_COMMENT': 'chatbubble-ellipses',
      'REEL_LIKE': 'heart',
      'REEL_COMMENT': 'chatbubble-ellipses',
      'MASS_COIN_TRANSFER_REQUEST': 'wallet',
      'MASS_COIN_TRANSFER_APPROVED': 'checkmark-circle',
      'MASS_COIN_TRANSFER_REJECTED': 'close-circle',
      'MASS_COIN_RECEIVED': 'arrow-down-circle',
      'MASS_COIN_SENT': 'arrow-up-circle',
      'SYSTEM_MESSAGE': 'information-circle'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: Notification['notificationType']): string {
    const colors: { [key in Notification['notificationType']]: string } = {
      'MESSAGE': '#3B82F6',
      'FRIEND_REQUEST': '#10B981',
      'POST_LIKE': '#EF4444',
      'POST_COMMENT': '#8B5CF6',
      'REEL_LIKE': '#EF4444',
      'REEL_COMMENT': '#8B5CF6',
      'MASS_COIN_TRANSFER_REQUEST': '#F59E0B',
      'MASS_COIN_TRANSFER_APPROVED': '#10B981',
      'MASS_COIN_TRANSFER_REJECTED': '#EF4444',
      'MASS_COIN_RECEIVED': '#10B981',
      'MASS_COIN_SENT': '#3B82F6',
      'SYSTEM_MESSAGE': '#6B7280'
    };
    return colors[type] || '#6B7280';
  }

  isMassCoinRelated(type: Notification['notificationType']): boolean {
    return type.includes('MASS_COIN');
  }

  // Mock data for development
  getMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        userId: 1,
        title: 'Mass Coin Transfer Request',
        message: 'John Doe wants to send you 50 Mass Coins',
        notificationType: 'MASS_COIN_TRANSFER_REQUEST',
        relatedId: '1',
        relatedType: 'MASS_COIN_TRANSFER',
        senderId: 2,
        senderName: 'John Doe',
        senderAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        read: false,
        deleted: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: 1,
        title: 'New Message',
        message: 'Jane Smith sent you a message',
        notificationType: 'MESSAGE',
        relatedId: 'chat_1',
        relatedType: 'CHAT',
        senderId: 3,
        senderName: 'Jane Smith',
        senderAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        read: false,
        deleted: false,
        createdAt: new Date(Date.now() - 300000).toISOString()
      }
    ];
  }
}

export const notificationService = new NotificationService(); 