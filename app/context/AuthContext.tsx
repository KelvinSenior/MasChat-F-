import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import client, { BASE_URL } from '../api/client';

type UserDetails = {
  profileType?: string;
  worksAt1?: string;
  worksAt2?: string;
  studiedAt?: string;
  wentTo?: string;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  showAvatar?: boolean;
  avatarSwipeEnabled?: boolean;
  avatar?: string;
  followerCount?: number;
  followingCount?: number;
};

type User = {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  avatar?: string;
  details?: UserDetails;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser?: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('user'),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load authentication data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  // Accepts the user object returned by your backend login endpoint
  const signIn = async (newToken: string, backendUser: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('userToken', newToken),
        AsyncStorage.setItem('user', JSON.stringify(backendUser)),
      ]);
      setToken(newToken);
      setUser(backendUser);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('userToken'),
        AsyncStorage.removeItem('user'),
      ]);
      setToken(null);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Accepts a partial user update, merges with current user, and updates storage/context
  const updateUser = async (updatedUser?: Partial<User>) => {
    try {
      if (!user) return;
      let mergedUser = updatedUser ? { ...user, ...updatedUser } : user;
      // Always fetch the latest user from backend after update
      const response = await client.get(`/users/${user.id}`);
      mergedUser = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  // Always fetches the latest user from backend and updates context/storage
  const refreshUser = async () => {
    try {
      if (!token || !user?.id) return;
      const response = await client.get(`/users/${user.id}`);
      const userData = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signOut,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
