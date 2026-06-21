import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import TabNavigator from './TabNavigator';
import SearchScreen from '../screens/SearchScreen';
import DesignDetailScreen from '../screens/DesignDetailScreen';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import ShopSnailsScreen from '../screens/ShopSnailsScreen';
import SnapDetailScreen from '../screens/SnapDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingConfirmScreen from '../screens/BookingConfirmScreen';
import ReservationDetailScreen from '../screens/ReservationDetailScreen';
import ReviewWriteScreen from '../screens/ReviewWriteScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="DesignDetail" component={DesignDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ShopSnails" component={ShopSnailsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SnapDetail" component={SnapDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
