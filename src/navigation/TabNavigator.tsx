import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SnailScreen from '../screens/SnailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import TabBarIcon, { TAB_ICON_SIZE } from '../components/TabBarIcon';

export type TabParamList = {
  홈: undefined;
  스네일: undefined;
  주변: undefined;
  일정: undefined;
  프로필: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

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
          marginTop: 3,
        },
        tabBarIconStyle: {
          width: TAB_ICON_SIZE[route.name],
          height: TAB_ICON_SIZE[route.name],
        },
        tabBarActiveTintColor: '#7D695D',
        tabBarInactiveTintColor: '#BBAFA8',
        tabBarIcon: ({ color }) => <TabBarIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="스네일" component={SnailScreen} />
      <Tab.Screen name="주변" children={() => <PlaceholderScreen name="주변" />} />
      <Tab.Screen name="일정" component={ScheduleScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
