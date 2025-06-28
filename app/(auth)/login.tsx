import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const isAxiosError = (error: any): error is AxiosError => {
    return error.isAxiosError === true;
  };

  const handleAxiosError = (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') return 'Request timeout. Check your connection.';
    if (error.response?.status === 401) return 'Invalid username or password';
    const data = error.response?.data as { message?: string };
    if (data?.message) return data.message;
    return 'Login failed. Please try again.';
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.71.125:8080/api/auth/login",
        {
          username: username.trim(),
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 8000
        }
      );

      console.log("Full response:", response); // For debugging

      if (response.data?.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('username', username.trim());

        // Add this line to check the stored token after saving it
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log("Stored token:", storedToken);

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back to MasChat!',
          visibilityTime: 3000,
          position: 'top',
          topOffset: 60
        });

        router.replace('/(tabs)/home');
        return;
      }
      throw new Error('Token missing in response');
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = 'Login failed. Please try again.';
      if (isAxiosError(error)) {
        if (error.response?.status === 200) {
          errorMessage = 'Login successful but redirection failed';
        } else {
          errorMessage = handleAxiosError(error);
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Login Issue',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 5000,
        topOffset: 60,
        props: { text2NumberOfLines: 4 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Place the function inside your component
  const testConnection = async () => {
    try {
      const response = await axios.get(
        "http://192.168.71.125:8080/api/auth/test",
        { timeout: 3000 }
      );
      console.log("Connection test:", response.data);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // Call it once when the component mounts
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Animatable.View
        animation="fadeInDown"
        duration={1000}
        style={styles.header}
      >
        <Image
          source={require("../../assets/GROUP 88-MasChat.png")}
          style={{ width: 120, height: 120, resizeMode: "contain", marginBottom: 8 }}
        />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Connect, chat, and share with MasChat</Text>
      </Animatable.View>
      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        style={styles.form}
      >
        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#1877f2",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 4,
    letterSpacing: 1,
  },
  subtitle: {
    color: "#6c757d",
    fontSize: 15,
    marginTop: 2,
    marginBottom: 8,
  },
  form: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#1877f2",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1877f2",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1877f2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#4e9af1",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgot: {
    color: "#1877f2",
    textAlign: "center",
    marginBottom: 16,
    textDecorationLine: "underline",
    fontSize: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#222",
  },
  or: {
    color: "#aaa",
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1877f2",
  },
  createButtonText: {
    color: "#1877f2",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#f02849",
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 6,
  },
});

function signIn(token: any, username: string) {
  throw new Error('Function not implemented.');
}
