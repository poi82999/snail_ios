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
import Button from '../components/Button';

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
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={['top', 'bottom']}>
        <View style={tw`flex-row items-center px-[20px] h-[54px]`}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`p-[4px]`}>
            <Ionicons name="chevron-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-1 items-center justify-center px-[40px] gap-y-[12px]`}>
          <Ionicons name="checkmark-circle-outline" size={56} color={colors.secondary} />
          <Text style={[typography.headingMd, { color: colors.secondary }]}>
            문의가 접수됐어요
          </Text>
          <Text style={[typography.bodySm, { color: colors.secondary50, textAlign: 'center' }]}>
            빠른 시일 내에 답변 드릴게요.{'\n'}감사합니다.
          </Text>
          <Button label="확인" onPress={() => navigation.goBack()} style={tw`mt-[24px] px-[40px]`} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* 헤더 */}
      <View style={tw`flex-row items-center justify-between px-[20px] h-[54px]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={tw`p-[4px]`}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary }]}>1:1 문의</Text>
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
            <Text style={[typography.bodySm, { fontFamily: fontFamily.semibold, color: colors.secondary }]}>
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
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.medium,
                      color: category === cat ? colors.secondary : colors.secondary50,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 문의 내용 */}
          <View style={tw`gap-y-[12px]`}>
            <Text style={[typography.bodySm, { fontFamily: fontFamily.semibold, color: colors.secondary }]}>
              문의 내용 <Text style={{ color: colors.danger }}>*</Text>
            </Text>
            <TextInput
              value={body}
              onChangeText={(t) => setBody(t.slice(0, 1000))}
              placeholder="문의 내용을 입력해주세요"
              placeholderTextColor={colors.disabled}
              multiline
              style={[
                tw`h-[180px] rounded-[8px] px-[14px] py-[14px]`,
                {
                  borderWidth: 1,
                  borderColor: colors.line,
                  fontFamily: fontFamily.regular,
                  fontSize: 14,
                  color: colors.secondary,
                  textAlignVertical: 'top',
                },
              ]}
            />
            <Text style={{ fontSize: 12, textAlign: 'right', color: colors.secondary50, fontFamily: fontFamily.regular }}>
              {body.length}/1000
            </Text>
          </View>

          {/* 안내 문구 */}
          <View style={[tw`rounded-[8px] px-[14px] py-[14px] gap-y-[4px]`, { backgroundColor: 'rgba(125,105,93,0.06)' }]}>
            <Text style={{ fontSize: 12, fontFamily: fontFamily.semibold, color: colors.secondary }}>
              📌 문의 안내
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 18, fontFamily: fontFamily.regular, color: colors.secondary50 }}>
              {'영업일 기준 1~3일 내에 답변 드려요.\n자세히 작성하실수록 빠른 처리가 가능해요.'}
            </Text>
          </View>
        </ScrollView>

        {/* 제출 버튼 */}
        <View style={tw`px-[20px] pb-[32px] pt-[12px]`}>
          <Button label="문의 접수하기" onPress={handleSubmit} disabled={!canSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
