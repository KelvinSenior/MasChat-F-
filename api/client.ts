import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://192.168.71.125:8080/api',
  timeout: 8000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;