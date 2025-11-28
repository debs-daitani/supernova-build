import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import DailyPowerMessage from './src/components/DailyPowerMessage';

export default function App() {
  return (
    <>
      <AppNavigator />
      <DailyPowerMessage />
      <StatusBar style="light" />
    </>
  );
}
