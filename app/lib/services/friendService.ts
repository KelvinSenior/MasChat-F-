import client from '../../api/client';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  isFriend?: boolean;
}

export interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: string;
  createdAt: string;
}

export const friendService = {
  // Get user's friends list
  async getFriends(userId: string): Promise<User[]> {
    try {
      const response = await client.get(`/friends/list/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  },

  // Get friend suggestions
  async getSuggestions(userId: string): Promise<User[]> {
    try {
      const response = await client.get(`/friends/suggestions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  },

  // Send friend request
  async sendFriendRequest(senderId: string, recipientId: string): Promise<void> {
    try {
      await client.post('/friends/request', null, {
        params: { senderId, recipientId }
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      await client.post(`/friends/accept/${requestId}`);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Delete friend request
  async deleteFriendRequest(requestId: string): Promise<void> {
    try {
      await client.delete(`/friends/request/${requestId}`);
    } catch (error) {
      console.error('Error deleting friend request:', error);
      throw error;
    }
  },

  // Get pending friend requests
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const response = await client.get(`/friends/pending/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  },

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await client.get(`/users/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
};

// Default export to fix warning
export default friendService; 