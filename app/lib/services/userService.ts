import axios from 'axios';

const BASE_URL = "http://10.132.74.85:8080/api";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  details?: {
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
    followerCount?: number;
    followingCount?: number;
  };
  verified?: boolean;
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const numericId = parseInt(userId, 10); // Convert string to number for backend
    const response = await axios.get(`${BASE_URL}/users/${numericId}`);
    console.log("Fetched user profile:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const numericId = parseInt(userId, 10);
    const response = await axios.put(`${BASE_URL}/users/${numericId}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const uploadImage = async (
  imageUri: string,
  type: 'profilePicture' | 'coverPhoto' | 'avatar',
  userId: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'profile.jpg',
    type: 'image/jpeg'
  } as any);

  let endpoint = '';
  if (type === 'profilePicture') {
    endpoint = `/users/${userId}/profile/picture`;
  } else if (type === 'coverPhoto') {
    endpoint = `/users/${userId}/cover/picture`;
  } else if (type === 'avatar') {
    endpoint = `/users/${userId}/avatar/picture`;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}${endpoint}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default function UserService() {
  return null;
}
