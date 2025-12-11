import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import auth from "./firebase";

function Login({ onLogin, navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
      setLoading(false);
      onLogin(); // parent login handler will trigger navigation reset
    } catch (err) {
      setLoading(false);
      let errorMessage = "Login failed. Please try again.";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email!";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password!";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address!";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password!";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      setError(errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <Image source={require("./assets/logo.jpg")} style={styles.logo} />
        <Text style={styles.appName}>SAM THE TWIN</Text>
        <Text style={styles.motive}>Your mind. Your space. Your growth.</Text>
      </View>

      <View style={styles.formCard}>
        {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        

        <TouchableOpacity 
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Text style={styles.signupLink} onPress={() => navigation.navigate("Signup")}>
          Sign Up
        </Text>
      </Text>
    </ScrollView>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#ffffff", justifyContent: "center" },
  topSection: { alignItems: "center", marginBottom: 30 },
  logo: { width: 100, height: 100, resizeMode: "contain", marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: "bold", color: "#333" },
  motive: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 5 },
  formCard: { backgroundColor: "#faf7f2", padding: 20, borderRadius: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginBottom: 15 },
  loginBtn: { backgroundColor: "#C0903E", padding: 12, borderRadius: 10, alignItems: "center" },
  loginBtnText: { color: "#fff", fontWeight: "bold" },
  signupText: { marginTop: 20, textAlign: "center", color: "#333" },
  signupLink: { color: "#C0903E", fontWeight: "bold" },
  errorMsg: { color: "red", marginBottom: 10, textAlign: "center" },
  loginBtnDisabled: { opacity: 0.6 },
});