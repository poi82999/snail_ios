import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { useCreateShopInquiry } from '../hooks/useShopInquiry';
import { colors, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopInquiry'>;

export default function ShopInquiryScreen({ route, navigation }: Props) {
  const { shopId } = route.params;
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);
  const createInquiry = useCreateShopInquiry();

  if (sent) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={['top', 'bottom']}>
        <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center gap-y-[12px] px-[40px]`}>
          <Ionicons name="checkmark-circle" size={56} color={colors.secondary} />
          <Text style={[typography.headingMd, { color: colors.secondary, textAlign: 'center' }]}>
            문의가 접수됐어요
          </Text>
          <Text style={[typography.bodySm, { color: colors.secondary50, textAlign: 'center' }]}>
            답변이 오면 알림으로 알려드릴게요
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={[tw`mt-[24px] h-[42px] px-[40px] rounded-[5px] items-center justify-center`, { backgroundColor: colors.secondary }]}
          >
            <Text style={[typography.bodySm, { color: colors.background }]}>확인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`mr-[12px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>샵 문의하기</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1`}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-[20px] pt-[24px] pb-[40px] gap-y-[16px]`}
        >
          <Text style={[typography.bodySm, { color: colors.secondary50 }]}>
            예약, 디자인, 가격 등 궁금한 점을 남겨주세요. 사장님이 직접 답변드려요.
          </Text>
          <TextInput
            value={body}
            onChangeText={(t) => setBody(t.slice(0, 500))}
            placeholder="문의 내용을 입력해주세요"
            placeholderTextColor={colors.secondary50}
            multiline
            maxLength={500}
            style={[
              tw`rounded-[10px] p-[16px]`,
              {
                minHeight: 160,
                backgroundColor: '#F7F5F3',
                fontSize: 14,
                color: colors.secondary,
                textAlignVertical: 'top',
              },
            ]}
          />
          <Text style={[typography.caption, { color: colors.secondary50, textAlign: 'right' }]}>
            {body.length}/500
          </Text>
          {createInquiry.isError && (
            <Text style={[typography.bodySm, { color: '#e53935', textAlign: 'center' }]}>
              전송에 실패했어요. 다시 시도해주세요.
            </Text>
          )}
        </ScrollView>

        <View style={tw`px-[20px] pb-[32px] pt-[12px]`}>
          <TouchableOpacity
            activeOpacity={body.trim().length > 0 ? 0.7 : 1}
            disabled={body.trim().length === 0 || createInquiry.isPending}
            onPress={() => {
              createInquiry.mutate(
                { shopId, body: body.trim() },
                { onSuccess: () => setSent(true) }
              );
            }}
            style={[
              tw`h-[42px] rounded-[5px] items-center justify-center`,
              { backgroundColor: body.trim().length > 0 ? colors.secondary : colors.disabled },
            ]}
          >
            <Text style={[typography.bodySm, { color: colors.background }]}>
              {createInquiry.isPending ? '전송 중...' : '문의 보내기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
