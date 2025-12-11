import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import auth from './firebase';

function Home({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  // Handle menu click actions
  const handleMenuClick = async (page) => {
    switch (page) {
      case "Logout":
        try {
          await auth().signOut();
          // Navigation will be handled automatically by onAuthStateChanged listener in App.js
        } catch (error) {
          Alert.alert("Error", "Failed to sign out. Please try again.");
        }
        break;
      case "Profile":
        navigation.navigate("Profile");
        break;
      case "Journals":
        navigation.navigate("Journals");
        break;
      case "Tasks & To-do List":
        navigation.navigate("Tasks");
        break;
      case "Social Connections":
        navigation.navigate("SocialConnections");
        break;
      case "Notifications":
        navigation.navigate("Notifications");
        break;
      case "New Chat":
        setMessages([]);
        setInput('');
        break;
      default:
        break;
    }
    setMenuOpen(false);
  };

  // Send chat message
  const handleSend = () => {
    if (input.trim() === '') return;

    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    scrollToBottom();
    setTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Hi, I am SAM 🤖", sender: 'ai' }]);
      setTyping(false);
      scrollToBottom();
    }, 1000);
  };

  // Speech-to-text mic
  const handleMic = () => {
    Alert.alert('Speech Recognition', 'Speech Recognition not implemented yet');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const menuItems = [
    { name: "Profile", icon: "👤" },
    { name: "Tasks & To-do List", icon: "📝" },
    { name: "Journals", icon: "📔" },
    { name: "Social Connections", icon: "🤝" },
    { name: "Notifications", icon: "🔔" },
    { name: "New Chat", icon: "💬" },
    { name: "Logout", icon: "🚪" }
  ];

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Text style={styles.welcome}>Welcome Back 👋</Text>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <View style={styles.sideMenu}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleMenuClick(item.name)}
            >
              <View style={styles.menuItemContainer}>
                <Text style={styles.menuIconEmoji}>{item.icon}</Text>
                <Text style={[styles.menuItem, item.name === 'Logout' && styles.logout]}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.chatBox}>
        <ScrollView ref={scrollRef} style={styles.messages}>
          {messages.map((msg, idx) => (
            <View key={idx} style={[styles.message, msg.sender === 'user' ? styles.userMsg : styles.aiMsg]}>
              <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
            </View>
          ))}
          {typing && (
            <View style={[styles.message, styles.aiMsg]}>
              <Text style={styles.aiText}>AI is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.chatInputBox}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type something..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.micButton} onPress={handleMic}>
            <Text style={styles.micButtonText}>🎙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>⬆</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF7F2',
    flex: 1,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  welcome: {
    fontSize: 24,
    color: '#3A3A3A',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  menuIcon: {
    fontSize: 28,
    color: '#3A3A3A',
    padding: 5,
  },
  sideMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 220,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuItem: {
    fontSize: 16,
    color: '#3A3A3A',
  },
  menuIconEmoji: {
    marginRight: 10,
    fontSize: 18,
  },
  logout: {
    marginTop: 'auto',
    color: '#C0903E',
    fontWeight: 'bold',
  },
  chatBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    maxWidth: 600,
    alignSelf: 'center',
    zIndex: 50,
  },
  messages: {
    maxHeight: 250,
    marginBottom: 6,
    paddingRight: 6,
  },
  message: {
    padding: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    maxWidth: '70%',
    marginVertical: 3,
  },
  userMsg: {
    backgroundColor: '#D6A84F',
    alignSelf: 'flex-end',
  },
  aiMsg: {
    backgroundColor: '#E8E2D6',
    alignSelf: 'flex-start',
  },
  userText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 19.6,
  },
  aiText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 19.6,
  },
  chatInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 50,
    elevation: 3,
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: 30,
  },
  micButton: {
    backgroundColor: '#D6A84F',
    fontSize: 18,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 50,
    marginRight: 10,
  },
  micButtonText: {
    fontSize: 18,
  },
  sendButton: {
    backgroundColor: '#D6A84F',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 20,
  },
});