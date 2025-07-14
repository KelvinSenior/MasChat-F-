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

const BASE_URL = "http://192.168.255.125:8080/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { signIn } = useAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      password: '',
    };

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
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
        `${BASE_URL}/auth/login`,
        { username: username.trim(), password },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      if (response.data?.token) {
        let { token, user } = response.data;
        if (user.userId && !user.id) user = { ...user, id: user.userId };
        
        await signIn(token, user);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('username', username.trim());
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back to MasChat!',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      Toast.show({
        type: 'error',
        text1: 'Login Error',
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
      await axios.get(`${BASE_URL}/auth/test`, { timeout: 3000 });
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => { testConnection(); }, []);

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
        <Image
          source={require("../../assets/GROUP 88-MasChat.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Connect, chat, and share with MasChat</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.form}>
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

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={['#1877f2', '#0a5bc4']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Log In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.divider} />
        </View>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.createButtonText}>Create New Account</Text>
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
  forgot: {
    color: "#1877f2",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
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
  createButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1877f2",
  },
  createButtonText: {
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