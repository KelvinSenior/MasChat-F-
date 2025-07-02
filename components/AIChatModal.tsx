import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Message = { text: string; isUser: boolean };
type AIChatModalProps = { visible: boolean; onClose: () => void };

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { text: inputText, isUser: true }]);
    setInputText('');
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: `I received: "${inputText}". This is a simulated response.`, isUser: false },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons
              name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
              size={28}
              color="#1877f2"
            />
          </TouchableOpacity>
          <Text style={styles.title}>AI Assistant</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={msg.isUser ? styles.userText : styles.aiText}>{msg.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#888" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  chatContainer: { flex: 1, paddingHorizontal: 10 },
  chatContent: { paddingBottom: 20 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1877f2',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 2,
  },
  userText: { color: 'white' },
  aiText: { color: '#000' },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#1877f2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});