import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { messageService, Message } from '../lib/services/messageService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Color Palette (matching Home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const recipient = params.recipient ? JSON.parse(params.recipient as string) : {
    username: "Unknown",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    id: "1",
    name: "Test User"
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pendingMessages = useRef<Message[]>([]);
  const stompClient = useRef<any>(null);

  const loadMessages = async () => {
    if (isLoading || !currentUser?.id) return;
    setIsLoading(true);
    try {
      const recipientId = recipient?.id || "1";
      const conversation = await messageService.getConversation(currentUser.id, recipientId);
      if (conversation && Array.isArray(conversation)) {
        // Merge with pending messages and remove duplicates
        const allMessages = [...conversation, ...pendingMessages.current];
        const uniqueMessages = allMessages.filter(
          (msg, index, self) => index === self.findIndex(m => m.id === msg.id)
        );
        setMessages(uniqueMessages.sort((a, b) => 
          new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime()
        ));
      }
    } catch (err) {
      console.log("Error loading messages:", err);
      // If API fails, show pending messages
      setMessages(pendingMessages.current);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [recipient?.id]);

  useEffect(() => {
    if (!currentUser?.id || !recipient?.id) return;
    const socket = new SockJS('http://10.132.74.85:8080/ws-chat');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: str => console.log(str),
      onConnect: () => {
        client.subscribe(`/user/${currentUser.id}/queue/messages`, message => {
          const msg = JSON.parse(message.body);
          if (
            (msg.senderId === currentUser.id && msg.recipientId === recipient.id) ||
            (msg.senderId === recipient.id && msg.recipientId === currentUser.id)
          ) {
            setMessages(prev => [...prev, {
              id: msg.timestamp || `${Date.now()}`,
              sender: { id: msg.senderId },
              recipient: { id: msg.recipientId },
              content: msg.content,
              sentAt: msg.timestamp,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
          }
        });
      },
    });
    client.activate();
    stompClient.current = client;
    return () => { client.deactivate(); };
  }, [currentUser?.id, recipient?.id]);

  const sendMessage = async () => {
    if (!text.trim() || isSending || !currentUser?.id) return;
    setIsSending(true);
    
    const msg = {
      senderId: currentUser.id,
      recipientId: recipient.id,
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    // Add to pending messages immediately for UI responsiveness
    const pendingMsg: Message = {
      id: msg.timestamp,
      sender: { id: msg.senderId },
      recipient: { id: msg.recipientId },
      content: msg.content,
      sentAt: msg.timestamp,
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPending: true,
    };
    setMessages(prev => [...prev, pendingMsg]);
    setText('');
    
    try {
      // Send via WebSocket for real-time
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(msg),
        });
      }
      
      // Also send via REST API for persistence
      const savedMessage = await messageService.sendMessage(currentUser.id, recipient.id, text);
      
      // Update the pending message with the saved message
      if (savedMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === pendingMsg.id ? { 
            ...msg, 
            id: savedMessage.id?.toString() || msg.id,
            sentAt: savedMessage.sentAt,
            isPending: false,
            time: new Date(savedMessage.sentAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === pendingMsg.id ? { ...msg, failed: true, isPending: false } : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentUser?.id) return;
    
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.deleteMessage(messageId, currentUser.id);
              setMessages(prev => prev.filter(msg => msg.id !== messageId));
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          }
        }
      ]
    );
  };

  const deleteConversation = async () => {
    if (!currentUser?.id) return;
    
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this entire conversation? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.deleteConversation(currentUser.id, recipient.id);
              router.back();
            } catch (error) {
              console.error('Error deleting conversation:', error);
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity 
      style={[
        styles.messageRow,
        item.sender.id === currentUser?.id ? styles.rowRight : styles.rowLeft
      ]}
      onLongPress={() => {
        if (item.sender.id === currentUser?.id) {
          deleteMessage(item.id);
        }
      }}
    >
      {item.sender.id !== currentUser?.id && (
        <Image 
          source={{ uri: recipient?.image || "https://randomuser.me/api/portraits/men/5.jpg" }} 
          style={styles.bubbleProfilePic} 
        />
      )}
      <LinearGradient
        colors={
          item.sender.id === currentUser?.id 
            ? [COLORS.primary, '#1A4B8C'] 
            : ['#f0f2f5', '#e4e6eb']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.messageBubble,
          item.sender.id === currentUser?.id ? styles.sent : styles.received,
          item.failed && styles.failedMessage,
          item.isPending && styles.pendingMessage
        ]}
      >
        {item.content && (
          <Text style={[
            styles.messageText,
            item.sender.id === currentUser?.id ? styles.sentText : styles.receivedText
          ]}>
            {item.content}
          </Text>
        )}
        {item.image && <Image source={item.image} style={styles.messageImage} />}
        <View style={styles.messageStatus}>
          {item.time && (
            <Text style={[
              styles.timeText,
              item.sender.id === currentUser?.id ? styles.sentTime : styles.receivedTime
            ]}>
              {item.time}
            </Text>
          )}
          {item.failed ? (
            <Ionicons name="warning" size={16} color="#ff4444" style={styles.statusIcon} />
          ) : item.isPending ? (
            <ActivityIndicator size="small" color={item.sender.id === currentUser?.id ? "#fff" : "#888"} style={styles.statusIcon} />
          ) : item.sender.id === currentUser?.id ? (
            <Ionicons name="checkmark-done" size={16} color="#fff" style={styles.statusIcon} />
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/videos');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileContainer}
          onPress={() => router.push({ pathname: "/(tabs)/profile", params: { user: JSON.stringify(recipient) } })}
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
            <Ionicons name="call-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="videocam-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => {
              Alert.alert(
                "Conversation Options",
                "What would you like to do?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete Conversation", style: "destructive", onPress: deleteConversation },
                  { text: "View Profile", onPress: () => router.push({ pathname: "/(tabs)/profile", params: { user: JSON.stringify(recipient) } }) }
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
                <Ionicons name="image" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Feather name="paperclip" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <MaterialIcons name="photo-camera" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { height: Math.max(44, inputHeight) }]}
              placeholder="Aa"
              placeholderTextColor={COLORS.lightText}
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
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
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
    borderColor: COLORS.accent,
  },
  headerInfo: { 
    marginLeft: 10,
  },
  headerTitle: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18,
  },
  headerSubtitle: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 13,
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center',
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: COLORS.lightText,
    fontSize: 14,
    marginTop: 4,
  },
  messagesContainer: { 
    padding: 16,
    paddingBottom: 80,
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
  },
  sentText: {
    color: 'white',
  },
  receivedText: {
    color: COLORS.text,
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
  },
  sentTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedTime: {
    color: COLORS.lightText,
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 4,
    minHeight: 36,
    maxHeight: 120,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
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