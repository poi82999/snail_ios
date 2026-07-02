import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { colors, typography } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

// 백엔드가 취소 사유를 필수로 요구한다(CANCEL_REASON_REQUIRED).
// 자주 쓰는 사유는 라디오로, 그 외엔 직접 입력으로 받는다.
const CANCEL_REASONS = [
  '일정이 변경됐어요',
  '개인 사정으로 방문이 어려워요',
  '다른 디자인으로 다시 예약할게요',
  '기타 (직접 입력)',
] as const;

const CUSTOM_REASON = CANCEL_REASONS[CANCEL_REASONS.length - 1];

interface CancelReservationModalProps {
  visible: boolean;
  onClose: () => void;
  isPending: boolean;
  errorMessage: string | null;
  onSubmit: (reason: string) => void;
}

export default function CancelReservationModal({
  visible,
  onClose,
  isPending,
  errorMessage,
  onSubmit,
}: CancelReservationModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  // visible 토글로만 열고 닫히므로, 닫힐 때 이전 선택이 남지 않게 초기화한다.
  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setCustomReason('');
    }
  }, [visible]);

  const isCustom = selectedReason === CUSTOM_REASON;
  const reason = isCustom ? customReason.trim() : (selectedReason ?? '');
  const canSubmit = reason.length > 0 && !isPending;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* 딤 배경 */}
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={tw`flex-1 bg-[rgba(0,0,0,0.4)]`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tw`flex-1 justify-end`}
        >
          {/* 바텀 시트 */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={[
                tw`bg-white rounded-t-[20px] px-[20px] pt-[20px]`,
                { paddingBottom: insets.bottom + 20 },
              ]}
            >
              {/* 핸들 */}
              <View style={tw`w-[40px] h-[4px] rounded-full bg-[#E5E5E5] self-center mb-[20px]`} />

              <Text style={[tw`text-[16px] text-[#1A1A1A] mb-[4px]`, { fontFamily: fontFamily.semibold }]}>
                예약을 취소할까요?
              </Text>
              <Text style={[typography.bodySm, { color: colors.secondary50, marginBottom: 16 }]}>
                취소 사유를 선택해주세요. 취소하면 되돌릴 수 없어요.
              </Text>

              {/* 취소 사유 라디오 */}
              <View style={tw`gap-y-[4px] mb-[12px]`}>
                {CANCEL_REASONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.7}
                    onPress={() => setSelectedReason(item)}
                    style={tw`flex-row items-center gap-x-[12px] py-[12px]`}
                  >
                    <View
                      style={[
                        tw`w-[20px] h-[20px] rounded-full border-[1.5px] items-center justify-center`,
                        { borderColor: selectedReason === item ? colors.secondary : colors.line },
                      ]}
                    >
                      {selectedReason === item && (
                        <View style={[tw`w-[10px] h-[10px] rounded-full`, { backgroundColor: colors.secondary }]} />
                      )}
                    </View>
                    <Text style={[typography.bodySm, { color: colors.primary }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 직접 입력 */}
              {isCustom && (
                <TextInput
                  value={customReason}
                  onChangeText={(t) => setCustomReason(t.slice(0, 200))}
                  placeholder="취소 사유를 입력해주세요"
                  placeholderTextColor={colors.disabled}
                  multiline
                  style={[
                    tw`h-[80px] rounded-[8px] px-[14px] py-[12px] text-[14px] mb-[8px]`,
                    {
                      borderWidth: 1,
                      borderColor: colors.line,
                      fontFamily: fontFamily.regular,
                      color: colors.primary,
                      textAlignVertical: 'top',
                    },
                  ]}
                />
              )}

              {errorMessage && (
                <Text style={[typography.bodySm, { color: colors.danger, marginBottom: 8, textAlign: 'center' }]}>
                  {errorMessage}
                </Text>
              )}

              {/* 취소 확정 버튼 */}
              <TouchableOpacity
                activeOpacity={canSubmit ? 0.7 : 1}
                disabled={!canSubmit}
                onPress={() => onSubmit(reason)}
                style={[
                  tw`mt-[8px] h-[42px] rounded-[5px] items-center justify-center`,
                  { backgroundColor: canSubmit ? colors.danger : colors.disabled },
                ]}
              >
                {isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={[typography.bodySm, { color: colors.background }]}>예약 취소</Text>
                )}
              </TouchableOpacity>

              {/* 닫기 */}
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={tw`items-center py-[14px]`}>
                <Text style={[typography.bodySm, { color: colors.secondary50 }]}>돌아가기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
