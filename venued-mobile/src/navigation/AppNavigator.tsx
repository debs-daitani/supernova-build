import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

// Screens
import LandingScreen from '../screens/LandingScreen';
import BackstageScreen from '../screens/BackstageScreen';
import SetlistScreen from '../screens/SetlistScreen';
import TourScreen from '../screens/TourScreen';
import CrewScreen from '../screens/CrewScreen';
import EntourageScreen from '../screens/EntourageScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{
    color: focused ? colors.pink : colors.textMuted,
    fontSize: 10,
    fontWeight: focused ? '700' : '400',
  }}>
    {label}
  </Text>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Backstage"
        component={BackstageScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🎭" focused={focused} />,
          tabBarLabel: 'Backstage',
        }}
      />
      <Tab.Screen
        name="Setlist"
        component={SetlistScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="⭐" focused={focused} />,
          tabBarLabel: 'Setlist',
        }}
      />
      <Tab.Screen
        name="Crew"
        component={CrewScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
          tabBarLabel: 'Crew',
        }}
      />
      <Tab.Screen
        name="Tour"
        component={TourScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="📅" focused={focused} />,
          tabBarLabel: 'Tour',
        }}
      />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
