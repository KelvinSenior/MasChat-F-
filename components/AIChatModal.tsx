import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar
} from 'react-native';

const { height } = Dimensions.get('window');

// Color Palette (matching app design)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  gradient1: ['#0A2463', '#1A4B8C'] as const,
  gradient2: ['#4facfe', '#00f2fe'] as const,
  gradient3: ['#fff', '#f8f9fa'] as const,
};

type Message = { 
  text: string; 
  isUser: boolean;
  time: string;
  id: string;
};
type AIChatModalProps = { visible: boolean; onClose: () => void };

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your MasChat AI assistant. How can I help you today?",
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';

  const fetchAIResponse = async (userMessage: string): Promise<string | null> => {
    try {
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No API key needed for public inference endpoint (may be rate-limited)
        },
        body: JSON.stringify({ inputs: userMessage })
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.generated_text) return data.generated_text;
      if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);
    // Try real AI API first
    let aiText: string | null = null;
    try {
      aiText = await fetchAIResponse(inputText);
    } catch (e) {
      aiText = null;
    }
    if (!aiText) {
      aiText = `I understand you're asking about "${inputText}". As your AI assistant, I can help with account questions, privacy settings, and connecting with friends.`;
    }
    const aiResponse: Message = {
      id: Date.now().toString(),
      text: aiText,
      isUser: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose}
      transparent={false}
      statusBarTranslucent={false}
    >
      <StatusBar 
        backgroundColor={COLORS.primary} 
        barStyle="light-content" 
        translucent={false}
      />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={COLORS.gradient1}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[COLORS.accent, '#FF9F4A']}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>MasChat AI</Text>
              <Text style={styles.subtitle}>
                {isLoading ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Chat Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  msg.isUser ? styles.userContainer : styles.aiContainer
                ]}
              >
                {!msg.isUser && (
                  <View style={styles.aiAvatarContainer}>
                    <LinearGradient
                      colors={[COLORS.accent, '#FF9F4A']}
                      style={styles.aiAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="sparkles" size={16} color={COLORS.white} />
                    </LinearGradient>
                  </View>
                )}
                <LinearGradient
                  colors={msg.isUser ? COLORS.gradient2 : COLORS.gradient3}
                  style={[
                    styles.messageBubble,
                    msg.isUser ? styles.userBubble : styles.aiBubble,
                    Platform.OS === 'android' ? styles.androidMessageShadow : styles.iosMessageShadow
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={msg.isUser ? styles.userText : styles.aiText}>
                    {msg.text}
                  </Text>
                  <Text style={[
                    styles.timeText,
                    msg.isUser ? styles.userTime : styles.aiTime
                  ]}>
                    {msg.time}
                  </Text>
                </LinearGradient>
              </View>
            ))}
            {isLoading && (
              <View style={styles.typingContainer}>
                <View style={[
                  styles.typingBubble,
                  Platform.OS === 'android' ? styles.androidMessageShadow : styles.iosMessageShadow
                ]}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Input Area */}
          <View style={[
            styles.inputContainer,
            Platform.OS === 'android' ? styles.androidInputShadow : styles.iosInputShadow
          ]}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.attachmentButton}>
                <MaterialCommunityIcons name="attachment" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message MasChat AI..."
                placeholderTextColor={COLORS.lightText}
                multiline
                onSubmitEditing={handleSend}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                  isLoading && styles.sendButtonLoading
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={inputText.trim() ? COLORS.white : COLORS.lightText} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  aiAvatarContainer: {
    marginRight: 8,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
  },
  iosMessageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  androidMessageShadow: {
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
  },
  userText: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  aiText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  timeText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiTime: {
    color: COLORS.lightText,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  iosInputShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  androidInputShadow: {
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  sendButtonLoading: {
    opacity: 0.8,
  },
});