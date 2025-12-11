import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";

const mockSuggestedUsers = [
  { id: 1, name: "Ali", interests: ["Music", "Cricket"] },
  { id: 2, name: "Ayesha", interests: ["Travel", "Cooking"] },
  { id: 3, name: "Ahmed", interests: ["Gaming", "Photography"] },
  { id: 4, name: "Sara", interests: ["Art", "Meditation"] },
];

const mockRequests = [
  { id: 5, name: "Hassan", interests: ["Books", "Fitness"], type: "received" },
  { id: 6, name: "Fatima", interests: ["Movies", "Tech"], type: "sent" },
];

function SocialConnections({ navigation }) {
  const [suggestedUsers, setSuggestedUsers] = useState(mockSuggestedUsers);
  const [requests, setRequests] = useState(mockRequests);
  const [connected, setConnected] = useState([]); // For connected users
  const [searchTerm, setSearchTerm] = useState("");

  const handleConnect = (id) => {
    const user = suggestedUsers.find(u => u.id === id);
    setRequests(prev => [...prev, { ...user, type: "sent" }]);
    setSuggestedUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAccept = (id) => {
    const user = requests.find(r => r.id === id);
    Alert.alert("Success", "Connection accepted!");
    setConnected(prev => [...prev, user]);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = (id) => {
    Alert.alert("Info", "Connection rejected!");
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleCancel = (id) => {
    Alert.alert("Info", "Request cancelled!");
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const filteredSuggested = suggestedUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.interests.join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConnected = connected.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Back to Home Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backButtonText}>⬅ Back to Home</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Suggested Users */}
        <Text style={styles.sectionTitle}>Suggested Users</Text>
        <View style={styles.listContainer}>
          {filteredSuggested.length === 0 ? (
            <Text style={styles.emptyText}>No suggestions found.</Text>
          ) : (
            filteredSuggested.map(user => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userIcon}>
                  <Text style={styles.userIconText}>👤</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userInterests}>{user.interests.join(", ")}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={() => handleConnect(user.id)}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Requests */}
        <Text style={styles.sectionTitle}>Connection Requests</Text>
        <View style={styles.listContainer}>
          {filteredRequests.length === 0 ? (
            <Text style={styles.emptyText}>No requests found.</Text>
          ) : (
            filteredRequests.map(req => (
              <View key={req.id} style={styles.userCard}>
                <View style={styles.userIcon}>
                  <Text style={styles.userIconText}>👤</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{req.name}</Text>
                  <Text style={styles.userInterests}>{req.interests.join(", ")}</Text>
                </View>
                {req.type === "received" ? (
                  <View style={styles.requestButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAccept(req.id)}
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(req.id)}
                    >
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancel(req.id)}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Connected Users */}
        <Text style={styles.sectionTitle}>Connected Users</Text>
        <View style={styles.listContainer}>
          {filteredConnected.length === 0 ? (
            <Text style={styles.emptyText}>No connections yet.</Text>
          ) : (
            filteredConnected.map(user => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userIcon}>
                  <Text style={styles.userIconText}>👤</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userInterests}>{user.interests.join(", ")}</Text>
                </View>
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default SocialConnections;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: "#D6A84F",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E2D6",
    fontSize: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 15,
    marginTop: 10,
  },
  listContainer: {
    marginBottom: 30,
  },
  userCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D6A84F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userIconText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 4,
  },
  userInterests: {
    fontSize: 14,
    color: "#666",
  },
  connectButton: {
    backgroundColor: "#D6A84F",
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  connectButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  requestButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: "#6BCB77",
  },
  rejectButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButton: {
    backgroundColor: "#FFD966",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  connectedBadge: {
    marginLeft: "auto",
  },
  connectedText: {
    fontSize: 12,
    color: "#6BCB77",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
});