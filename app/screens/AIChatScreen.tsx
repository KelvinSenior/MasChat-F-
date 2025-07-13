import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AIChatScreen({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{text: string, isUser: boolean, time: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (inputText.trim()) {
      const userMessage = { 
        text: inputText, 
        isUser: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsTyping(true);
      
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: `I'm your MasChat AI assistant. I received your message: "${inputText}". I can help with questions about the app, connections, and more.`, 
          isUser: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://i.imgur.com/JgYD2nQ.png' }} // Your AI assistant avatar
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>MasChat AI</Text>
            <Text style={styles.subtitle}>
              {isTyping ? 'Typing...' : 'Online'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        <ScrollView 
          contentContainerStyle={styles.messagesContainer}
          ref={ref => ref?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.welcomeBubble}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.welcomeText}>Hi! I'm your MasChat AI assistant. Ask me anything about the app or how to connect with others.</Text>
              </LinearGradient>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View key={index} style={[
                styles.messageContainer,
                msg.isUser ? styles.userContainer : styles.aiContainer
              ]}>
                {!msg.isUser && (
                  <Image
                    source={{ uri: 'https://i.imgur.com/JgYD2nQ.png' }}
                    style={styles.aiAvatar}
                  />
                )}
                <LinearGradient
                  colors={msg.isUser ? ['#4facfe', '#00f2fe'] : ['#fff', '#f8f9fa']}
                  style={[
                    styles.messageBubble, 
                    msg.isUser ? styles.userBubble : styles.aiBubble
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
            ))
          )}
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachmentButton}>
              <MaterialIcons name="attachment" size={24} color="#1877f2" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message MasChat AI..."
              placeholderTextColor="#888"
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                !inputText.trim() && styles.sendButtonDisabled
              ]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#fff" : "#aaa"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'sans-serif-medium'
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'sans-serif'
  },
  closeButton: {
    padding: 6,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'sans-serif'
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'sans-serif'
  },
  aiText: {
    color: '#222',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'sans-serif'
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
    fontFamily: 'sans-serif'
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiTime: {
    color: '#888',
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1877f2',
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  attachmentButton: {
    padding: 6,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: '#222',
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: 'sans-serif'
  },
  sendButton: {
    backgroundColor: '#1877f2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
});