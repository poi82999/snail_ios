import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';

import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import { useLoginGate } from '../hooks/useRequireAuth';
import { navigationRef } from '../navigation/navigationRef';

// 비로그인 사용자가 찜/예약/스네일/팔로우를 시도하면 뜨는 전역 로그인 유도 모달.
// 표시 상태는 loginGate 스토어가 제어한다(useRequireAuth 선제 호출 + 쿼리 401 안전망).
export default function LoginGateModal() {
  const insets = useSafeAreaInsets();
  const { visible, close } = useLoginGate();

  function goToLogin() {
    close();
    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      {/* 딤 배경 — 탭하면 닫힘 */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={close}
        style={tw`flex-1 bg-[rgba(0,0,0,0.4)] justify-end`}
      >
        {/* 바텀 시트 — 내부 탭은 닫히지 않게 흡수 */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View
            style={[
              tw`bg-white rounded-t-[20px] px-[20px] pt-[20px]`,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={tw`w-[40px] h-[4px] rounded-full bg-[#E5E5E5] self-center mb-[20px]`} />

            <Text
              style={[tw`text-[18px] mb-[8px]`, { color: colors.primary, fontFamily: fontFamily.semibold }]}
            >
              로그인이 필요해요
            </Text>
            <Text style={[typography.bodySm, { color: colors.text, marginBottom: 24 }]}>
              찜, 예약, 스네일 작성·반응은 로그인 후 이용할 수 있어요.
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={goToLogin}
              style={[
                tw`h-[42px] rounded-[5px] items-center justify-center`,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[typography.bodySm, { color: colors.background }]}>로그인하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={close}
              style={tw`mt-[12px] h-[42px] items-center justify-center`}
            >
              <Text style={[typography.bodySm, { color: colors.text }]}>닫기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
