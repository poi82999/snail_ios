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
import NotificationScreen from '../screens/NotificationScreen';
import LoginScreen from '../screens/LoginScreen';
import InquiryScreen from '../screens/InquiryScreen';
import CouponScreen from '../screens/CouponScreen';
import RelatedDesignsScreen from '../screens/RelatedDesignsScreen';
import ShopReviewsScreen from '../screens/ShopReviewsScreen';
import ShopInquiryScreen from '../screens/ShopInquiryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
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
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Coupon" component={CouponScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="RelatedDesigns" component={RelatedDesignsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ShopReviews" component={ShopReviewsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ShopInquiry" component={ShopInquiryScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
