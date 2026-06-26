import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

const CATEGORIES = ['서비스 이용 문의', '버그/오류 신고', '결제 문의', '기타'] as const;
type Category = typeof CATEGORIES[number];

export default function InquiryScreen() {
  const navigation = useNavigation();
  const [category, setCategory] = useState<Category | null>(null);
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = category !== null && body.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    // 데모: 일반 고객센터 API 미구현 → 성공 상태만 표시
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={['top', 'bottom']}>
        <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`p-[4px]`}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center px-[40px] gap-y-[12px]`}>
          <Ionicons name="checkmark-circle-outline" size={56} color={colors.secondary} />
          <Text style={[tw`text-[18px] text-[#1A1A1A]`, { fontFamily: fontFamily.semibold }]}>
            문의가 접수됐어요
          </Text>
          <Text style={[typography.bodySm, { color: colors.text, textAlign: 'center' }]}>
            빠른 시일 내에 답변 드릴게요.{'\n'}감사합니다.
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
      {/* 헤더 */}
      <View style={tw`flex-row items-center justify-between px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`p-[4px]`}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={[tw`text-[16px] text-[#1A1A1A]`, { fontFamily: fontFamily.semibold }]}>문의하기</Text>
        <View style={tw`w-[32px]`} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={tw`flex-1`}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`px-[20px] pt-[24px] pb-[40px] gap-y-[24px]`}
        >
          {/* 문의 유형 */}
          <View style={tw`gap-y-[12px]`}>
            <Text style={[tw`text-[14px] text-[#1A1A1A]`, { fontFamily: fontFamily.semibold }]}>
              문의 유형 <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <View style={tw`flex-row flex-wrap gap-[8px]`}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat)}
                  style={[
                    tw`h-[35px] px-[14px] rounded-[5px] items-center justify-center`,
                    {
                      borderWidth: 1,
                      borderColor: category === cat ? colors.secondary : colors.line,
                      backgroundColor: category === cat ? 'rgba(125,105,93,0.08)' : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      tw`text-[13px]`,
                      {
                        fontFamily: fontFamily.medium,
                        color: category === cat ? colors.secondary : colors.text,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 문의 내용 */}
          <View style={tw`gap-y-[12px]`}>
            <Text style={[tw`text-[14px] text-[#1A1A1A]`, { fontFamily: fontFamily.semibold }]}>
              문의 내용 <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <TextInput
              value={body}
              onChangeText={(t) => setBody(t.slice(0, 1000))}
              placeholder="문의 내용을 입력해주세요"
              placeholderTextColor={colors.disabled}
              multiline
              style={[
                tw`h-[180px] rounded-[8px] px-[14px] py-[14px] text-[14px]`,
                {
                  borderWidth: 1,
                  borderColor: colors.line,
                  fontFamily: fontFamily.regular,
                  color: colors.primary,
                  textAlignVertical: 'top',
                },
              ]}
            />
            <Text style={[tw`text-right text-[12px]`, { color: colors.disabled, fontFamily: fontFamily.regular }]}>
              {body.length}/1000
            </Text>
          </View>

          {/* 안내 문구 */}
          <View style={[tw`rounded-[8px] px-[14px] py-[14px] gap-y-[4px]`, { backgroundColor: 'rgba(125,105,93,0.06)' }]}>
            <Text style={[tw`text-[12px]`, { fontFamily: fontFamily.medium, color: colors.secondary }]}>
              📌 문의 안내
            </Text>
            <Text style={[tw`text-[12px] leading-[18px]`, { fontFamily: fontFamily.regular, color: colors.text }]}>
              {'영업일 기준 1~3일 내에 답변 드려요.\n자세히 작성하실수록 빠른 처리가 가능해요.'}
            </Text>
          </View>
        </ScrollView>

        {/* 제출 버튼 */}
        <View style={tw`px-[20px] pb-[32px] pt-[12px]`}>
          <TouchableOpacity
            activeOpacity={canSubmit ? 0.7 : 1}
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={[
              tw`h-[42px] rounded-[5px] items-center justify-center`,
              { backgroundColor: canSubmit ? colors.secondary : colors.disabled },
            ]}
          >
            <Text style={[typography.bodySm, { color: colors.background }]}>문의 접수하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
