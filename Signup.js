import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import auth from "./firebase";

function Signup({ navigation, onSignup }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    interest: "",
    gender: "",
    education: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
    // Clear general error
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    // Field name mappings for user-friendly messages
    const fieldNames = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      interest: "Interest",
      gender: "Gender",
      education: "Education Level",
    };

    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'interest', 'gender', 'education'];
    
    requiredFields.forEach(field => {
      const fieldValue = formData[field];
      // Check if field is empty - handle both string and other types
      const isEmpty = !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');
      if (isEmpty) {
        errors[field] = `${fieldNames[field]} is required`;
        hasErrors = true;
      }
    });

    // Email validation
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
        hasErrors = true;
      }
    }

    // Password validation
    if (formData.password && formData.password.trim() !== '') {
      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
        hasErrors = true;
      }
    }

    // Password match validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return { isValid: !hasErrors, errors };
  };

  const handleSubmit = async () => {
    // Validate form - get errors directly from validation result
    const validationResult = validateForm();
    
    if (!validationResult.isValid) {
      // Show general error message
      setError("Please fix the errors below");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Create user with Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(
        formData.email.trim(),
        formData.password
      );

      // Update user profile with display name
      await userCredential.user.updateProfile({
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      });

      // Sign out the user so they can login manually
      await auth().signOut();

      setLoading(false);
      // Navigate to login page after successful signup
      Alert.alert(
        "Success", 
        "Account Created Successfully! Please login with your credentials.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Login");
            }
          }
        ]
      );
    } catch (err) {
      setLoading(false);
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered!";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address!";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak!";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <Image source={require("./assets/logo.jpg")} style={styles.logo} />
        <Text style={styles.appName}>SAM THE TWIN</Text>
        <Text style={styles.motive}>Let's build your personalized space.</Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={styles.half}>
            <TextInput
              style={[
                styles.input,
                fieldErrors.firstName && styles.inputError
              ]}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(val) => handleChange("firstName", val)}
            />
            {fieldErrors.firstName && (
              <Text style={styles.fieldError}>{fieldErrors.firstName}</Text>
            )}
          </View>
          <View style={styles.half}>
            <TextInput
              style={[
                styles.input,
                fieldErrors.lastName && styles.inputError
              ]}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(val) => handleChange("lastName", val)}
            />
            {fieldErrors.lastName && (
              <Text style={styles.fieldError}>{fieldErrors.lastName}</Text>
            )}
          </View>
        </View>

        <View>
          <TextInput
            style={[
              styles.input,
              fieldErrors.email && styles.inputError
            ]}
            placeholder="Email"
            value={formData.email}
            onChangeText={(val) => handleChange("email", val)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {fieldErrors.email && (
            <Text style={styles.fieldError}>{fieldErrors.email}</Text>
          )}
        </View>

        <View>
          <TextInput
            style={[
              styles.input,
              fieldErrors.password && styles.inputError
            ]}
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChangeText={(val) => handleChange("password", val)}
            secureTextEntry
          />
          {fieldErrors.password && (
            <Text style={styles.fieldError}>{fieldErrors.password}</Text>
          )}
        </View>

        <View>
          <TextInput
            style={[
              styles.input,
              fieldErrors.confirmPassword && styles.inputError
            ]}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(val) => handleChange("confirmPassword", val)}
            secureTextEntry
          />
          {fieldErrors.confirmPassword && (
            <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
          )}
        </View>

        {/* Pickers */}
        <View>
          <Picker
            selectedValue={formData.interest}
            onValueChange={(val) => handleChange("interest", val)}
            style={[
              styles.input,
              fieldErrors.interest && styles.inputError
            ]}
          >
            <Picker.Item label="Interest" value="" />
            <Picker.Item label="Mental Health" value="Mental Health" />
            <Picker.Item label="Productivity" value="Productivity" />
            <Picker.Item label="Self Improvement" value="Self Improvement" />
          </Picker>
          {fieldErrors.interest && (
            <Text style={styles.fieldError}>{fieldErrors.interest}</Text>
          )}
        </View>

        <View>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(val) => handleChange("gender", val)}
            style={[
              styles.input,
              fieldErrors.gender && styles.inputError
            ]}
          >
            <Picker.Item label="Gender" value="" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
          {fieldErrors.gender && (
            <Text style={styles.fieldError}>{fieldErrors.gender}</Text>
          )}
        </View>

        <View>
          <Picker
            selectedValue={formData.education}
            onValueChange={(val) => handleChange("education", val)}
            style={[
              styles.input,
              fieldErrors.education && styles.inputError
            ]}
          >
            <Picker.Item label="Education Level" value="" />
            <Picker.Item label="Matric" value="Matric" />
            <Picker.Item label="Intermediate" value="Intermediate" />
            <Picker.Item label="Bachelor" value="Bachelor" />
            <Picker.Item label="Masters" value="Masters" />
          </Picker>
          {fieldErrors.education && (
            <Text style={styles.fieldError}>{fieldErrors.education}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.signupBtn, loading && styles.signupBtnDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
          Login
        </Text>
      </Text>
    </ScrollView>
  );
}

export default Signup;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FAF7F2",
    alignItems: "center",
    paddingBottom: 30,
  },
  topSection: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 20,
    backgroundColor: "#D6A84F",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#D6A84F",
    fontSize: 20,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  motive: {
    fontSize: 14,
    opacity: 0.9,
    color: "#fff",
    textAlign: "center",
  },
  formCard: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  errorMsg: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  half: {
    flex: 1,
    minWidth: "48%",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginTop: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 2,
  },
  fieldError: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signupBtn: {
    width: "100%",
    padding: 15,
    marginTop: 18,
    backgroundColor: "#D6A84F",
    borderRadius: 14,
    alignItems: "center",
  },
  signupBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
  },
  loginLink: {
    color: "#C0903E",
    fontWeight: "bold",
  },
  signupBtnDisabled: {
    opacity: 0.6,
  },
});