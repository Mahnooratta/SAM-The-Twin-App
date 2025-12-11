import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import auth from './firebase';

// Import your screens (all in root folder)
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './Forgotpassword';
import ResetPassword from './ResetPassword';
import Home from './Home';
import JournalsPage from './Journals';
import Tasks from './Tasks';
import SocialConnections from './SocialConnections';
import Notifications from './Notifications';
import Profile from './Profile';

const Stack = createNativeStackNavigator();

// Deep linking configuration
const linking = {
  prefixes: ['myapp://', 'https://sam-twin.firebaseapp.com', 'https://sam-twin.web.app'],
  config: {
    screens: {
      ResetPassword: {
        path: 'reset-password',
        parse: {
          oobCode: (oobCode) => oobCode,
          mode: (mode) => mode,
        },
      },
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',
      Home: 'home',
    },
  },
};

export default function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const navigationRef = useRef(null);

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;

      try {
        let oobCode = null;
        let mode = null;

        // Handle Firebase password reset link format
        // Format: https://sam-twin.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=CODE&apiKey=KEY
        if (url.includes('__/auth/action') || url.includes('reset-password') || url.includes('oobCode=')) {
          // Parse URL - handle both http:// and myapp:// schemes
          let urlToParse = url;
          if (url.startsWith('myapp://')) {
            urlToParse = url.replace('myapp://', 'https://');
          }
          
          const urlObj = new URL(urlToParse);
          oobCode = urlObj.searchParams.get('oobCode');
          mode = urlObj.searchParams.get('mode') || 'resetPassword';
        }
        // Handle custom scheme: myapp://reset-password?oobCode=CODE
        else if (url.startsWith('myapp://')) {
          const urlObj = new URL(url.replace('myapp://', 'https://'));
          oobCode = urlObj.searchParams.get('oobCode');
          mode = urlObj.searchParams.get('mode') || 'resetPassword';
        }

        if (mode === 'resetPassword' && oobCode) {
          // Wait for navigation to be ready
          setTimeout(() => {
            if (navigationRef.current) {
              navigationRef.current.navigate('ResetPassword', {
                oobCode: oobCode,
                mode: mode,
              });
            }
          }, 1000);
        }
      } catch (err) {
        console.log('Error parsing deep link:', err);
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for auth state changes - this is the single source of truth
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      const isLoggedIn = !!user;
      setUserLoggedIn(isLoggedIn);
      
      if (initializing) {
        setInitializing(false);
      }
      
      // Reset navigation immediately when auth state changes
      if (navigationRef.current && !initializing) {
        if (isLoggedIn) {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, [initializing]);

  // Reset navigation when auth state changes (backup for non-initial state changes)
  useEffect(() => {
    if (navigationRef.current && !initializing) {
      if (userLoggedIn) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  }, [userLoggedIn, initializing]);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator 
        screenOptions={{ headerShown: true }}
        initialRouteName="Login"
      >
        {/* Auth screens */}
        <Stack.Screen name="Login" options={{ title: 'Login' }}>
          {(props) => (
            <Login 
              {...props} 
              onLogin={() => {}} 
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Signup" options={{ title: 'Sign Up' }}>
          {(props) => (
            <Signup 
              {...props} 
              onSignup={() => {}} 
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPassword}
          options={{ title: 'Forgot Password' }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPassword}
          options={{ title: 'Reset Password' }}
        />
        
        {/* Authenticated screens */}
        <Stack.Screen 
          name="Home" 
          options={{ title: 'Home' }}
        >
          {(props) => (
            <Home 
              {...props} 
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="Journals" 
          component={JournalsPage}
          options={{ title: 'Journals' }}
        />
        <Stack.Screen 
          name="Tasks" 
          component={Tasks}
          options={{ title: 'Tasks' }}
        />
        <Stack.Screen 
          name="SocialConnections" 
          component={SocialConnections}
          options={{ title: 'Social' }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={Notifications}
          options={{ title: 'Notifications' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile}
          options={{ title: 'Profile' }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}