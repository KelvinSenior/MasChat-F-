import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Use the same BASE_URL as your login screen
const BASE_URL = "http://192.168.255.125:8080/api";

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
    const response = await client.get('/auth/test-connection', {
      timeout: 5000
    });
    return response.data === "Backend is reachable";
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
};

export default client;
