import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Message = {
  id: string;
  sender: { id: string };
  recipient: { id: string };
  content?: string;
  image?: any;
  time?: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipient = params.recipient ? JSON.parse(params.recipient as string) : null;
  const currentUser = { id: '37' }; // Replace with actual user ID from context/auth
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!recipient) {
      // Handle case where recipient is not available
      console.warn("No recipient provided");
      return;
    }

    // Load existing messages
    axios.get(`http://10.132.74.85:8080/api/messages/conversation/${recipient.id}`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));
  }, [recipient]);

  const sendMessage = () => {
    if (!text.trim() || !recipient) return; // Add recipient check
    
    const newMessage = {
      id: Date.now().toString(),
      sender: { id: currentUser.id },
      recipient: { id: recipient.id },
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setText('');
    
    // You should also send this message to your backend
    axios.post('http://10.132.74.85:8080/api/messages', newMessage)
      .catch(err => console.error("Failed to send message:", err));
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender.id === currentUser.id ? styles.sent : styles.received,
      ]}
    >
      {item.content && <Text style={styles.messageText}>{item.content}</Text>}
      {item.image && <Image source={item.image} style={styles.messageImage} />}
      {item.time && <Text style={styles.timeText}>{item.time}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{recipient?.name || "Chat"}</Text>
          <Text style={styles.headerSubtitle}>{recipient?.username || ""}</Text>
        </View>
        <View style={styles.headerActions}>
          <Ionicons name="call-outline" size={24} color="#fff" style={styles.headerIcon} />
          <Ionicons name="videocam-outline" size={24} color="#fff" />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Aa"
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  headerSubtitle: { color: '#aaa', fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 12 },
  messagesContainer: { padding: 16, paddingBottom: 80 },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 10,
    marginBottom: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#1877f2',
    position: 'relative',
  },
  sent: { alignSelf: 'flex-end', backgroundColor: '#1877f2' },
  received: { alignSelf: 'flex-start', backgroundColor: '#222' },
  messageText: { color: '#fff', fontSize: 16 },
  messageImage: {
    width: 180,
    height: 100,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  timeText: {
    color: '#e0e0e0',
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#1877f2',
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },
});