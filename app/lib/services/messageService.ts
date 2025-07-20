import client from '../../api/client';

export interface Message {
  id: string;
  sender: { id: string };
  recipient: { id: string };
  content?: string;
  image?: any;
  time?: string;
  sentAt?: string;
  isPending?: boolean;
  failed?: boolean;
  read?: boolean;
}

export interface RecentChat {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export const messageService = {
  // Get conversation between two users
  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    try {
      const response = await client.get(`/messages/conversation?userId1=${userId1}&userId2=${userId2}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  },

  // Get recent chats for a user
  async getRecentChats(userId: string): Promise<RecentChat[]> {
    try {
      const response = await client.get(`/messages/recent/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  },

  // Send a message
  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message | null> {
    try {
      const response = await client.post('/messages/send', null, {
        params: { senderId, recipientId, content }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  // Mark messages as read
  async markAsRead(userId: string, partnerId: string): Promise<void> {
    try {
      await client.post('/messages/mark-read', null, {
        params: { userId, partnerId }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Delete a message
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      await client.delete(`/messages/${messageId}?userId=${userId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  },

  // Delete entire conversation
  async deleteConversation(userId: string, partnerId: string): Promise<void> {
    try {
      await client.delete('/messages/conversation', {
        params: { userId, partnerId }
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }
};

// Default export to fix warning
export default messageService; 