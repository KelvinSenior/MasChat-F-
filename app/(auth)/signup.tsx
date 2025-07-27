import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import client, { BASE_URL, testConnection } from '../api/client';

// Color Palette (matching home screen)
const COLORS = {
  light: {
    primary: '#3A8EFF',  // New Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#F5F7FA',
    white: '#FFFFFF',
    text: '#333333',
    lightText: '#888888',
    card: '#FFFFFF',
    border: '#E0E0E0',
    error: '#FF4444',
  },
  dark: {
    primary: '#3A8EFF',  // New Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#1A1A2E',
    white: '#FFFFFF',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    card: '#2D2D44',
    border: '#404040',
    error: '#FF6B6B',
  },
};

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  const { signIn } = useAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    };

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (fullName && fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    const isConnected = await testConnection();
    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: 'Cannot reach server. Check your network and server IP.',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await client.post(
        `/auth/register`,
        { 
          username: username.trim(), 
          email: email.trim(), 
          password,
          fullName: fullName.trim() || null 
        },
        { 
          headers: { 'Content-Type': 'application/json' }, 
          timeout: 10000 
        }
      );

      if (response.data && response.data.token && response.data.userId) {
        const { token, user, userId, username: responseUsername } = response.data;
        
        // Create user object with proper structure
        const userObj = {
          id: userId,
          username: responseUsername || user?.username,
          email: user?.email,
          fullName: user?.fullName,
          profilePicture: user?.profilePicture,
          coverPhoto: user?.coverPhoto,
          bio: user?.bio,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
          verified: user?.verified,
          ...user // Include any additional fields
        };

        await signIn(token, userObj);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userObj));
        await AsyncStorage.setItem('username', userObj.username);
        
        Toast.show({
          type: 'success',
          text1: 'Signup Successful',
          text2: 'Welcome to MasChat!',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
        
        router.replace('/(tabs)/home');
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error: any) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response) {
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = 'Validation error. Please check your inputs.';
        } else if (error.response.status === 409) {
          errorMessage = 'Username or email already exists.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again.';
      } else {
        errorMessage = 'Request setup error. Please try again.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 5000,
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await client.get(`/auth/test`, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => { 
    testConnection(); 
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header matching home screen */}
      <LinearGradient
        colors={[COLORS.primary, '#2B6CD9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.logo}>
          Mas<Text style={{ color: COLORS.accent }}>Chat</Text>
        </Text>
      </LinearGradient>

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the MasChat community</Text>

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name (Optional)"
              placeholderTextColor={COLORS.lightText}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.lightText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.lightText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.lightText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.lightText} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.lightText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleSignup}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#ccc'] : [COLORS.accent, '#FF9E40']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.lightText,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
    height: 50,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e4e6eb",
  },
  or: {
    color: COLORS.lightText,
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#f02849",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 12,
  },
});