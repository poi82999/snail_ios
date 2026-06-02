import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SnailScreen from '../screens/SnailScreen';

export type TabParamList = {
  홈: undefined;
  스네일: undefined;
  주변: undefined;
  일정: undefined;
  프로필: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  홈: { active: 'home', inactive: 'home-outline' },
  스네일: { active: 'snow', inactive: 'snow-outline' },
  주변: { active: 'location', inactive: 'location-outline' },
  일정: { active: 'calendar', inactive: 'calendar-outline' },
  프로필: { active: 'person', inactive: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 85,
          paddingHorizontal: 34,
          paddingTop: 10,
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 1.5,
          elevation: 3,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarActiveTintColor: '#7D695D',
        tabBarInactiveTintColor: '#BBAFA8',
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={35} color={color} />;
        },
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="스네일" component={SnailScreen} />
      <Tab.Screen name="주변" children={() => <PlaceholderScreen name="주변" />} />
      <Tab.Screen name="일정" children={() => <PlaceholderScreen name="일정" />} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
