import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { colors, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileEdit'>;

export default function ProfileEditScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={{ height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`p-[4px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>프로필 수정</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={tw`flex-1 items-center justify-center mb-[54px]`}>
        <Text style={[typography.bodySm, { color: colors.secondary50 }]}>준비 중이에요</Text>
      </View>
    </SafeAreaView>
  );
}
