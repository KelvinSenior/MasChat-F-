import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../app/context/ThemeContext';
import { massCoinService, WalletInfo } from '../app/lib/services/massCoinService';

interface MassCoinBalanceProps {
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: any;
  textColor?: string;
}

export default function MassCoinBalance({ 
  size = 'medium', 
  showIcon = true, 
  style,
  textColor
}: MassCoinBalanceProps) {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = {
    light: { text: '#212529' },
    dark: { text: '#FFFFFF' }
  };
  const defaultTextColor = textColor || colors[currentTheme === 'dark' ? 'dark' : 'light'].text;
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  // Fallback to mock data if wallet is null
  const displayWallet = wallet || massCoinService.getMockWallet();

  const loadWallet = async () => {
    try {
      setIsLoading(true);
      const walletData = await massCoinService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet:', error);
      // Use mock data when API is not available
      setWallet(massCoinService.getMockWallet());
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
          icon: 12,
          text: 10,
        };
      case 'large':
        return {
          container: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
          icon: 20,
          text: 14,
        };
      default: // medium
        return {
          container: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
          icon: 16,
          text: 12,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Show loading state briefly
  if (isLoading && !wallet) {
    return (
      <View style={[styles.massCoinBalance, sizeStyles.container, style]}>
        <Text style={[styles.balanceText, { fontSize: sizeStyles.text, color: defaultTextColor }]}>
          ...
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.massCoinBalance,
        sizeStyles.container,
        style
      ]} 
      onPress={() => router.push('/screens/MassCoinDashboardScreen')}
    >
      {showIcon && (
        <MaterialIcons 
          name="monetization-on" 
          size={sizeStyles.icon} 
          color="#FFD700" 
        />
      )}
      <Text style={[styles.balanceText, { fontSize: sizeStyles.text, color: defaultTextColor }]}>
        {massCoinService.formatAmount(displayWallet.balance)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  massCoinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    gap: 4,
  },
  balanceText: {
    fontWeight: '600',
    color: '#333',
  },
}); 