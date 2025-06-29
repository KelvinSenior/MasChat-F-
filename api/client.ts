import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://10.132.74.85:8080/api'; // Use actual IP and port

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utility function to test backend connection
export const testConnection = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/test-connection`, {
      timeout: 5000
    });
    return response.data === "Backend is reachable";
  } catch (error) {
    return false;
  }
};

export default client;