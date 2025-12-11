import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// React Native Firebase automatically initializes using native config files:
// - android/app/google-services.json (for Android)
// - ios/MyApp/GoogleService-Info.plist (for iOS)
// Make sure these files are downloaded from Firebase Console and added to your project

export { auth, firestore };
export default auth;
