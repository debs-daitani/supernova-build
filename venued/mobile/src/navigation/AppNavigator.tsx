import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

// Screens
import LandingScreen from '../screens/LandingScreen';
import BackstageScreen from '../screens/BackstageScreen';
import CrewScreenNew from '../screens/CrewScreenNew';
import TourScreen from '../screens/TourScreen';
import HypeStationScreen from '../screens/HypeStationScreen';
import EntourageScreen from '../screens/EntourageScreen';
import ExecutiveFunctionScreen from '../screens/ExecutiveFunctionScreen';
import FocusTimerScreen from '../screens/FocusTimerScreen';
import TimeBlindnessScreen from '../screens/TimeBlindnessScreen';
import ResetProtocolsScreen from '../screens/ResetProtocolsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ label, focused }: { label: string; focused: boolean | string }) => {
  const isFocused = focused === true || focused === 'true';
  return (
    <Text style={{
      color: isFocused ? colors.pink : colors.textMuted,
      fontSize: 18,
    }}>
      {label}
    </Text>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Tab 1: Backstage - Dashboard (keep as-is) */}
      <Tab.Screen
        name="Backstage"
        component={BackstageScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🎤" focused={focused} />,
          tabBarLabel: 'Backstage',
        }}
      />

      {/* Tab 2: Crew - Merged tasks (old Setlist + old Crew + FUCK IT DO IT) */}
      <Tab.Screen
        name="Crew"
        component={CrewScreenNew}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
          tabBarLabel: 'Crew',
        }}
      />

      {/* Tab 3: Tour - Calendar (keep as-is) */}
      <Tab.Screen
        name="Tour"
        component={TourScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🗓️" focused={focused} />,
          tabBarLabel: 'Tour',
        }}
      />

      {/* Tab 4: Setlist - NEW Hype Station */}
      <Tab.Screen
        name="Setlist"
        component={HypeStationScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🎵" focused={focused} />,
          tabBarLabel: 'Setlist',
        }}
      />

      {/* Tab 5: Entourage - 9 ADHD tools */}
      <Tab.Screen
        name="Entourage"
        component={EntourageScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🧠" focused={focused} />,
          tabBarLabel: 'Entourage',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ExecutiveFunction" component={ExecutiveFunctionScreen} />
        <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
        <Stack.Screen name="TimeBlindness" component={TimeBlindnessScreen} />
        <Stack.Screen name="ResetProtocols" component={ResetProtocolsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
