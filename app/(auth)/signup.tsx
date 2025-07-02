import { Ionicons } from '@expo/vector-icons';
import axios, { AxiosError } from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';

// const BASE_URL = "http://10.132.74.85:8080/api"; // Same as your login
const BASE_URL = "http://10.132.74.85:8080/api"; // Same as your login

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!formData.username.trim()) {
      newErrors.username = 'Name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle Axios errors
  const isAxiosError = (error: any): error is AxiosError => {
    return error.isAxiosError === true;
  };

  const handleAxiosError = (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') return 'Request timeout. Check your connection.';
    if (error.response?.status === 409) return 'Email already registered';
    const data = error.response?.data as { message?: string };
    if (data?.message) return data.message;
    return 'Registration failed. Please try again.';
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const { username, email, password } = formData;
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        {
          username: username.trim(),
          email: email.trim(),
          password: password,
          fullName: username.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000,
        }
      );

      if (response.data?.message === "User registered successfully!") {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Welcome to MasChat!',
          visibilityTime: 3000,
          position: 'top',
          topOffset: 60
        });
        setTimeout(() => router.replace('/(auth)/login'), 1500);
        return;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      const errorMessage = isAxiosError(error) 
        ? handleAxiosError(error) 
        : 'Registration failed. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 60,
        props: {
          text2NumberOfLines: 4
        }
      });
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleRegister();
    }
  };

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View
            animation="fadeInDown"
            duration={1000}
            style={styles.header}
          >
            <Image
              source={require('../../assets/GROUP 88-MasChat.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MasChat community today</Text>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            style={styles.formContainer}
          >
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#6c757d"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#6c757d"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6c757d"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6c757d"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#6c757d"
                secureTextEntry={!showPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              />
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Already have account */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.loginLinkText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 8,
  },
  title: {
    color: "#1877f2",
    fontSize: 28,
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
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#1877f2",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: "#222",
    fontSize: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  passwordToggle: {
    padding: 4,
  },
  button: {
    backgroundColor: "#1877f2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#f02849",
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 6,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    color: "#1877f2",
    fontWeight: "bold",
    fontSize: 16,
  },
});