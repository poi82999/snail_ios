import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { useAuth } from '../hooks/useAuth';
import GuestEmptyState from '../components/GuestEmptyState';

export default function CouponScreen() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`mr-[12px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>쿠폰함</Text>
      </View>

      {!isAuthenticated ? (
        <GuestEmptyState message="로그인하고 보유한 쿠폰을 확인해보세요" />
      ) : (
        <View style={tw`flex-1 items-center justify-center gap-y-[12px]`}>
          <Ionicons name="ticket-outline" size={48} color={colors.secondary50} />
          <Text style={[typography.bodyMd, { color: colors.secondary50 }]}>보유한 쿠폰이 없어요</Text>
          <Text style={[typography.bodySm, { color: colors.secondary50, textAlign: 'center', paddingHorizontal: 40 }]}>
            예약 완료 후 발급되는 쿠폰이{'\n'}여기에 표시됩니다
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
