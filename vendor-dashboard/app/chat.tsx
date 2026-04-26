import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Camera,
  Paperclip,
  Mic,
  Check,
  CheckCheck,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "vendor" | "customer" | "rider";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "order" | "location" | "payment";
  orderInfo?: {
    id: string;
    items: string[];
    total: number;
    status: string;
  };
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'd like to place an order for delivery.",
    sender: "customer",
    timestamp: "2:30 PM",
    status: "read",
    type: "text",
  },
  {
    id: "2",
    text: "Hi! Sure, what would you like to order?",
    sender: "vendor",
    timestamp: "2:32 PM",
    status: "delivered",
    type: "text",
  },
  {
    id: "3",
    text: "I'll have the Jollof Rice with Chicken, and 2 bottles of water.",
    sender: "customer",
    timestamp: "2:33 PM",
    status: "read",
    type: "text",
  },
  {
    id: "4",
    text: "Perfect! That will be ₦3,500. Delivery to Block A, Room 101?",
    sender: "vendor",
    timestamp: "2:35 PM",
    status: "delivered",
    type: "text",
  },
  {
    id: "5",
    text: "Yes, that's correct. How long will it take?",
    sender: "customer",
    timestamp: "2:36 PM",
    status: "read",
    type: "text",
  },
  {
    id: "6",
    text: "Your order will be ready in about 25-30 minutes.",
    sender: "vendor",
    timestamp: "2:37 PM",
    status: "delivered",
    type: "text",
  },
  {
    id: "7",
    text: "Order confirmed! #ORD-2024-001\n\nJollof Rice with Chicken\n2x Bottled Water\n\nTotal: ₦3,500",
    sender: "vendor",
    timestamp: "2:38 PM",
    status: "delivered",
    type: "order",
    orderInfo: {
      id: "ORD-2024-001",
      items: ["Jollof Rice with Chicken", "2x Bottled Water"],
      total: 3500,
      status: "Confirmed",
    },
  },
  {
    id: "8",
    text: "Great, thank you!",
    sender: "customer",
    timestamp: "2:40 PM",
    status: "delivered",
    type: "text",
  },
];

const chatUsers = {
  customer: { name: "John Doe", phone: "+234 801 234 5678", status: "online" },
  rider: {
    name: "Mike Johnson",
    phone: "+234 803 456 7890",
    status: "delivering",
  },
  vendor: {
    name: "Your Business",
    phone: "+234 802 345 6789",
    status: "active",
  },
};

export default function VendorChat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState<
    "vendor" | "customer" | "rider"
  >("vendor");
  const [chatPartner, setChatPartner] = useState<"customer" | "rider">(
    "customer",
  );

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: currentUser,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
        type: "text",
      };

      setMessages([...messages, newMessage]);
      setInputText("");

      // Simulate message status updates
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
          ),
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "read" } : msg,
          ),
        );
      }, 3000);

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCall = () => {
    Alert.alert("Call", `Call ${chatUsers[chatPartner].name}?`);
  };

  const handleVideoCall = () => {
    Alert.alert("Video Call", `Video call ${chatUsers[chatPartner].name}?`);
  };

  const handleMoreOptions = () => {
    Alert.alert("More Options", "Additional chat options coming soon...");
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender === currentUser;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {chatUsers[message.sender].name.charAt(0)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
            message.type === "order" && styles.orderMessageBubble,
          ]}
        >
          {message.type === "order" && message.orderInfo ? (
            <View style={styles.orderMessage}>
              <Text style={styles.orderTitle}>📋 Order Confirmation</Text>
              <Text style={styles.orderId}>{message.orderInfo.id}</Text>
              {message.orderInfo.items.map((item, index) => (
                <Text key={index} style={styles.orderItem}>
                  • {item}
                </Text>
              ))}
              <Text style={styles.orderTotal}>
                Total: ₦{message.orderInfo.total.toLocaleString()}
              </Text>
              <View
                style={[
                  styles.orderStatus,
                  { backgroundColor: Colors.primaryLight },
                ]}
              >
                <Text style={styles.orderStatusText}>
                  {message.orderInfo.status}
                </Text>
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {message.text}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {message.timestamp}
            </Text>
            {isOwnMessage && (
              <View style={styles.messageStatus}>
                {message.status === "read" ? (
                  <CheckCheck size={16} color={Colors.blue} />
                ) : message.status === "delivered" ? (
                  <CheckCheck size={16} color={Colors.gray} />
                ) : (
                  <Check size={16} color={Colors.gray} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const partner = chatUsers[chatPartner];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.dark} />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{partner.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{partner.name}</Text>
                <Text style={styles.userStatus}>{partner.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleCall}>
              <Phone size={20} color={Colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleVideoCall}>
              <Video size={20} color={Colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMoreOptions}>
              <MoreVertical size={20} color={Colors.dark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          <View style={styles.messagesList}>{messages.map(renderMessage)}</View>
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachmentButton}>
              <Paperclip size={24} color={Colors.gray} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={24} color={Colors.gray} />
            </TouchableOpacity>
            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Send size={20} color={Colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.voiceButton}>
                <Mic size={24} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  userStatus: {
    fontSize: 12,
    color: Colors.green,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderMessageBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.dark,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  ownMessageTime: {
    color: Colors.white,
  },
  otherMessageTime: {
    color: Colors.gray,
  },
  messageStatus: {
    marginLeft: 4,
  },
  orderMessage: {
    padding: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  orderItem: {
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 8,
    marginBottom: 8,
  },
  orderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachmentButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  cameraButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 24,
  },
  voiceButton: {
    padding: 8,
  },
});
