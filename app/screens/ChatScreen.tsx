import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Message = {
  id: string;
  sender: { id: string };
  recipient: { id: string };
  content?: string;
  image?: any;
  time?: string;
  sentAt?: string;
  isPending?: boolean;
  failed?: boolean;
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipient = params.recipient ? JSON.parse(params.recipient as string) : {
    username: "Unknown",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    id: "1",
    name: "Test User"
  };
  
  const currentUser = { id: '37' }; // Replace with actual user ID from context/auth
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pendingMessages = useRef<Message[]>([]);

  const loadMessages = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const recipientId = recipient?.id || "1";
      const res = await axios.get(`http://192.168.255.125:8080/api/messages/conversation/${recipientId}`);
      
      if (res.data && Array.isArray(res.data)) {
        // Merge with pending messages and remove duplicates
        const allMessages = [...res.data, ...pendingMessages.current];
        const uniqueMessages = allMessages.filter(
          (msg, index, self) => index === self.findIndex(m => m.id === msg.id)
        );
        
        setMessages(uniqueMessages.sort((a, b) => 
          new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime()
        ));
      }
    } catch (err) {
      console.log("Error loading messages:", err);
      // If API fails, show pending messages only
      setMessages(pendingMessages.current);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Optional: Set up polling if you need periodic updates
    // const pollInterval = setInterval(loadMessages, 10000);
    // return () => clearInterval(pollInterval);
  }, [recipient?.id]);

  const sendMessage = async () => {
    if (!text.trim() || isSending) return;
    
    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      sender: { id: currentUser.id },
      recipient: { id: recipient?.id || "1" },
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentAt: new Date().toISOString(),
      isPending: true
    };
    
    // Add to pending messages and update UI immediately
    pendingMessages.current = [...pendingMessages.current, newMessage];
    setMessages(prev => [...prev, newMessage]);
    setText('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      if (recipient?.id) {
        const response = await axios.post('http://192.168.255.125:8080/api/messages', {
          ...newMessage,
          isPending: undefined // Don't send this to backend
        });
        
        if (response.data) {
          // Replace temp message with server-confirmed message
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId ? { 
                ...response.data, 
                time: newMessage.time,
                sentAt: response.data.sentAt || newMessage.sentAt
              } : msg
            )
          );
          
          // Remove from pending
          pendingMessages.current = pendingMessages.current.filter(msg => msg.id !== tempId);
        }
      }
    } catch (err) {
      console.log("Failed to send message:", err);
      // Mark as failed but keep in UI
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, failed: true, isPending: false } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageRow,
      item.sender.id === currentUser.id ? styles.rowRight : styles.rowLeft
    ]}>
      {item.sender.id !== currentUser.id && (
        <Image 
          source={{ uri: recipient?.image || "https://randomuser.me/api/portraits/men/5.jpg" }} 
          style={styles.bubbleProfilePic} 
        />
      )}
      <LinearGradient
        colors={
          item.sender.id === currentUser.id 
            ? ['#1877f2', '#0a5bc4'] 
            : ['#f0f2f5', '#e4e6eb']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.messageBubble,
          item.sender.id === currentUser.id ? styles.sent : styles.received,
          item.failed && styles.failedMessage,
          item.isPending && styles.pendingMessage
        ]}
      >
        {item.content && (
          <Text style={[
            styles.messageText,
            item.sender.id === currentUser.id ? styles.sentText : styles.receivedText
          ]}>
            {item.content}
          </Text>
        )}
        {item.image && <Image source={item.image} style={styles.messageImage} />}
        <View style={styles.messageStatus}>
          {item.time && (
            <Text style={[
              styles.timeText,
              item.sender.id === currentUser.id ? styles.sentTime : styles.receivedTime
            ]}>
              {item.time}
            </Text>
          )}
          {item.failed ? (
            <Ionicons name="warning" size={16} color="#ff4444" style={styles.statusIcon} />
          ) : item.isPending ? (
            <ActivityIndicator size="small" color={item.sender.id === currentUser.id ? "#fff" : "#888"} style={styles.statusIcon} />
          ) : item.sender.id === currentUser.id ? (
            <Ionicons name="checkmark-done" size={16} color="#fff" style={styles.statusIcon} />
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => router.push({ pathname: "/screens/ProfileScreen", params: { user: JSON.stringify(recipient) } })}
        >
          <Image 
            source={{ uri: recipient?.image || "https://randomuser.me/api/portraits/men/5.jpg" }} 
            style={styles.profilePic} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{recipient?.name || recipient?.username || "Chat"}</Text>
            <Text style={styles.headerSubtitle}>Active now</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="call-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/(create)/LiveScreen')}>
            <Ionicons name="videocam-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1877f2" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.leftIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="image" size={24} color="#1877f2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="paperclip" size={24} color="#1877f2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <MaterialIcons name="photo-camera" size={24} color="#1877f2" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { height: Math.max(44, inputHeight) }]}
              placeholder="Aa"
              placeholderTextColor="#888"
              value={text}
              onChangeText={setText}
              multiline
              onContentSizeChange={e => setInputHeight(e.nativeEvent.contentSize.height)}
              editable={!isSending}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                !text.trim() ? styles.sendBtnDisabled : {},
                isSending ? styles.sendBtnSending : {}
              ]} 
              onPress={sendMessage}
              disabled={!text.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
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
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 12,
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
  backButton: {
    padding: 6,
    marginRight: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: { 
    marginLeft: 10,
  },
  headerTitle: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18,
    fontFamily: 'sans-serif-medium'
  },
  headerSubtitle: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 13,
    fontFamily: 'sans-serif'
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginLeft: 'auto'
  },
  headerIconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'sans-serif-medium'
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'sans-serif'
  },
  messagesContainer: { 
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  rowLeft: { 
    justifyContent: 'flex-start',
  },
  rowRight: { 
    justifyContent: 'flex-end',
  },
  bubbleProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#e4e6eb",
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sent: {
    borderBottomRightRadius: 4,
  },
  received: {
    borderBottomLeftRadius: 4,
  },
  pendingMessage: {
    opacity: 0.8,
  },
  failedMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'sans-serif'
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#222',
  },
  messageImage: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'sans-serif'
  },
  sentTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedTime: {
    color: '#888',
  },
  statusIcon: {
    marginLeft: 4,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f2f5',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: '#222',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 4,
    minHeight: 36,
    maxHeight: 120,
    fontFamily: 'sans-serif'
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  sendBtn: {
    backgroundColor: '#1877f2',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#b0c4de',
  },
  sendBtnSending: {
    opacity: 0.7,
  },
});