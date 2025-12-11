import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from "react-native";
import { Picker } from "@react-native-picker/picker";

function Profile({ navigation }) {
  const [user, setUser] = useState({
    name: "Aqsa",
    email: "aqsa@example.com",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [privacySetting, setPrivacySetting] = useState("Everyone");

  const loginHistory = [
    "Logged in from iPhone - Dec 9, 2025",
    "Logged in from Chrome Desktop - Dec 8, 2025",
    "Password changed - Dec 5, 2025"
  ];

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Edit profile clicked (link functions later).");
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Change password soon!");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => Alert.alert("Success", "Account deleted!")
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backButtonText}>⬅ Back to Home</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.heading, darkMode && styles.darkText]}>Your Profile</Text>

      {/* Profile Card */}
      <View style={[styles.profileCard, darkMode && styles.darkCard]}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>
        <Text style={[styles.userName, darkMode && styles.darkText]}>{user.name}</Text>
        <Text style={[styles.email, darkMode && styles.darkTextSecondary]}>{user.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>✏ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={[styles.settingsSection, darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#E8E2D6", true: "#D6A84F" }}
            thumbColor={darkMode ? "#fff" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity 
          style={styles.settingItemClickable}
          onPress={handleChangePassword}
        >
          <Text style={[styles.settingItemText, darkMode && styles.darkText]}>
            Change Password ➜
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItemClickable, styles.dangerItem]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.settingItemText, styles.dangerText]}>
            Delete Account ❌
          </Text>
        </TouchableOpacity>
      </View>

      {/* Privacy */}
      <View style={[styles.privacySection, darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Privacy Settings</Text>
        <Picker
          selectedValue={privacySetting}
          onValueChange={setPrivacySetting}
          style={[styles.privacyPicker, darkMode && styles.darkPicker]}
        >
          <Picker.Item label="Everyone" value="Everyone" />
          <Picker.Item label="Connections Only" value="Connections Only" />
          <Picker.Item label="Only Me" value="Only Me" />
        </Picker>
      </View>

      {/* Login History */}
      <View style={[styles.historySection, darkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Login History</Text>
        {loginHistory.map((entry, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={[styles.historyText, darkMode && styles.darkTextSecondary]}>
              • {entry}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    padding: 20,
  },
  darkContainer: {
    backgroundColor: "#1A1A1A",
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 20,
    textAlign: "center",
  },
  darkText: {
    color: "#FFFFFF",
  },
  darkTextSecondary: {
    color: "#CCCCCC",
  },
  profileCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: "#2A2A2A",
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D6A84F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  profileIconText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#D6A84F",
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  settingsSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A3A3A",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2D6",
  },
  settingLabel: {
    fontSize: 16,
    color: "#3A3A3A",
  },
  settingItemClickable: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2D6",
  },
  settingItemText: {
    fontSize: 16,
    color: "#3A3A3A",
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  privacySection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  privacyPicker: {
    height: 50,
    backgroundColor: "#FAF7F2",
    borderRadius: 10,
  },
  darkPicker: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
  },
  historySection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E2D6",
  },
  historyText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});