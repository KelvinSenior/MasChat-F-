import client, { BASE_URL } from '../../api/client';
import { Post } from './postService';

export type UserDetails = {
  profileType?: string;
  worksAt1?: string;
  worksAt2?: string;
  studiedAt?: string;
  wentTo?: string;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  showAvatar?: boolean;
  avatar?: string;
  avatarSwipeEnabled?: boolean; // <-- Custom field if needed in your app logic
  followerCount?: number;
  followingCount?: number;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  avatar?: string;
  details: UserDetails;
  verified?: boolean;
};

/**
 * Fetch user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await client.get(`/users/${userId}`);
    console.log("Fetched user profile:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user profile fields
 */
export const updateProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const response = await client.put(`/users/${userId}/profile`, profileData);
    console.log("Updated user profile:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload image for profile picture, cover photo, or avatar
 */
export const uploadImage = async (
  imageUri: string,
  type: 'profilePicture' | 'coverPhoto' | 'avatar',
  userId: string,
  showAvatar?: boolean // <-- add this optional argument
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: `${type}.jpg`,
    type: 'image/jpeg',
  } as any);

  let endpoint = '';
  if (type === 'profilePicture') {
    endpoint = `/users/${userId}/profile/picture`;
  } else if (type === 'coverPhoto') {
    endpoint = `/users/${userId}/cover/photo`;
  } else if (type === 'avatar') {
    endpoint = `/users/${userId}/avatar/picture${showAvatar !== undefined ? `?showAvatar=${showAvatar}` : ''}`;
  }

  const response = await client.post(
    endpoint,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  avatar?: string;
};

export async function fetchNotifications(userId: string) {
  const res = await client.get(`/notifications/${userId}`);
  return res.data as Notification[];
}

export async function markNotificationRead(notificationId: string) {
  await client.post(`/notifications/read/${notificationId}`);
}

export async function acceptFriendRequest(requestId: string) {
  await client.post(`/friends/accept/${requestId}`);
}

export async function deleteNotification(notificationId: string) {
  await client.delete(`/notifications/${notificationId}`);
}

export async function deleteFriendRequest(requestId: string, userId: string) {
  await client.delete('/users/request', { data: { fromUserId: requestId, toUserId: userId } });
}

export async function unfriend(userId: string, friendId: string): Promise<void> {
  await client.delete(`/friends/remove?userId=${userId}&friendId=${friendId}`);
}

export type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export async function getUserFriends(userId: string): Promise<Friend[]> {
  try {
    const response = await client.get(`/friends/list/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user friends:', error.response?.data || error.message);
    throw error;
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const response = await client.get(`/posts/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user posts:', error.response?.data || error.message);
    throw error;
  }
}

export async function getBestFriends(userId: string): Promise<Friend[]> {
  try {
    const response = await client.get(`/users/${userId}/best-friends`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching best friends:', error.response?.data || error.message);
    throw error;
  }
}

export default function UserService() {
  return null;
}
