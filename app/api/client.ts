import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Use the same BASE_URL as your login screen
export const BASE_URL = "http://10.132.74.85:8080/api";

const client = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to automatically add Authorization header
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// Utility function to test backend connection
export const testConnection = async () => {
  try {
    const response = await client.get('/auth/test', {
      timeout: 5000
    });
    return response.data === "Backend connection successful";
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
};

export default client;
