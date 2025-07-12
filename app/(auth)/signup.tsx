import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

const BASE_URL = "http://10.132.74.85:8080/api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Added fullName field
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
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

      // Check for successful response structure
      if (response.data && response.data.token && response.data.userId) {
        const { token, userId, username: responseUsername } = response.data;
        
        // Create user object with minimal required fields
        const user = {
          id: userId,
          username: responseUsername,
          token: token,
          // Add other fields that might be returned
          ...(response.data.user || {})
        };

        await signIn(token, user);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', userId.toString());
        await AsyncStorage.setItem('username', responseUsername);
        
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
    } catch (error) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        if (error.response) {
          // The request was made and the server responded with a status code
          if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.status === 400) {
            errorMessage = 'Validation error. Please check your inputs.';
          } else if (error.response.status === 409) {
            errorMessage = 'Username or email already exists.';
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. Please try again.';
        } else {
          // Something happened in setting up the request
          errorMessage = 'Request setup error. Please try again.';
        }
      } else if (error instanceof Error) {
        // Generic error
        errorMessage = error.message;
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
      const response = await axios.get(`${BASE_URL}/auth/test`, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => { 
    testConnection(); 
  }, []);

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
        <Image
          source={require("../../assets/GROUP 88-MasChat.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the MasChat community</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.form}>
        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-circle-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name (Optional)"
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
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
            colors={['#4facfe', '#00f2fe']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
      </Animatable.View>
      <Toast />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 8,
  },
  title: {
    color: "#1877f2",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    marginTop: 2,
    fontFamily: 'sans-serif'
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
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
    color: "#222",
    fontSize: 16,
    fontFamily: 'sans-serif'
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
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
    color: "#888",
    marginHorizontal: 10,
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
  },
  loginButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1877f2",
  },
  loginButtonText: {
    color: "#1877f2",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
  },
  errorText: {
    color: "#f02849",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 12,
    fontFamily: 'sans-serif'
  },
});