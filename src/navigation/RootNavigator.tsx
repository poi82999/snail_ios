import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import DesignDetailScreen from '../screens/DesignDetailScreen';
import SnapDetailScreen from '../screens/SnapDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingDateScreen from '../screens/BookingDateScreen';
import BookingTimeScreen from '../screens/BookingTimeScreen';
import BookingConfirmScreen from '../screens/BookingConfirmScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DesignDetail" component={DesignDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SnapDetail" component={SnapDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BookingDate" component={BookingDateScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BookingTime" component={BookingTimeScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
