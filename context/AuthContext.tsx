import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  userToken: string | null;
  username: string | null;
  isLoading: boolean;
  signIn: (token: string, username: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  userToken: null,
  username: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const user = await AsyncStorage.getItem('username');
        
        if (token && user) {
          setUserToken(token);
          setUsername(user);
        }
      } catch (e) {
        console.error('Restoring token failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, username: string) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('username', username);
    setUserToken(token);
    setUsername(username);
    router.replace('/(tabs)/home');
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('username');
    setUserToken(null);
    setUsername(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ userToken, username, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);