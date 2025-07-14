import axios from 'axios';

const BASE_URL = "http://192.168.255.125:8080/api";

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
    const response = await axios.get(`${BASE_URL}/users/${userId}`);
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
    const response = await axios.put(`${BASE_URL}/users/${userId}/profile`, profileData);
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

  const response = await axios.post(
    `${BASE_URL}${endpoint}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export default function UserService() {
  return null;
}
