import React from 'react';
import { Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ensure Alert.alert and confirmations work on React Native Web
if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const fullMessage = [title, message].filter(Boolean).join('\n\n');

    if (!buttons || buttons.length === 0) {
      window.alert(fullMessage);
      return;
    }

    if (buttons.length >= 2) {
      const confirmed = window.confirm(fullMessage);
      if (confirmed) {
        const confirmBtn = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];
        if (confirmBtn?.onPress) confirmBtn.onPress();
      } else {
        const cancelBtn = buttons.find((b) => b.style === 'cancel');
        if (cancelBtn?.onPress) cancelBtn.onPress();
      }
    } else {
      window.alert(fullMessage);
      if (buttons[0]?.onPress) buttons[0].onPress();
    }
  };
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
