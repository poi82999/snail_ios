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
import { REPORT_REASONS, type ReportReason, type ReportTargetType } from '../api/reportApi';
import { useCreateReport } from '../hooks/useReport';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
}

export default function ReportModal({ visible, onClose, targetType, targetId }: ReportModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const { mutate, isPending } = useCreateReport();

  // 컴포넌트가 언마운트되지 않고 visible prop만 토글되므로, 닫힘 경로와 무관하게
  // 닫힐 때 상태를 초기화한다(다음 신고에서 이전 완료 화면이 잔존하지 않도록).
  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setDetail('');
      setSubmitted(false);
      setSubmitError(false);
    }
  }, [visible]);

  function handleClose() {
    setSelectedReason(null);
    setDetail('');
    setSubmitted(false);
    onClose();
  }

  function handleSubmit() {
    if (!selectedReason) return;
    setSubmitError(false);
    mutate(
      { targetType, targetId, reason: selectedReason, detail: detail || undefined },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => setSubmitError(true),
      }
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      {/* 딤 배경 */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={tw`flex-1 bg-[rgba(0,0,0,0.4)]`}
      >
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

              {submitted ? (
                /* 완료 상태 */
                <View style={tw`items-center py-[40px] gap-y-[12px]`}>
                  <Text style={[tw`text-[18px] text-[#1A1A1A]`, { fontFamily: fontFamily.semibold }]}>
                    신고가 접수됐어요
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.text, textAlign: 'center' }]}>
                    검토 후 조치하겠습니다.{'\n'}감사합니다.
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    activeOpacity={0.7}
                    style={[tw`mt-[16px] h-[42px] w-full rounded-[5px] items-center justify-center`, { backgroundColor: colors.primary }]}
                  >
                    <Text style={[typography.bodySm, { color: colors.background }]}>확인</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={[tw`text-[16px] text-[#1A1A1A] mb-[20px]`, { fontFamily: fontFamily.semibold }]}>
                    신고하기
                  </Text>

                  {/* 신고 사유 */}
                  <View style={tw`gap-y-[4px] mb-[16px]`}>
                    {REPORT_REASONS.map((reason) => (
                      <TouchableOpacity
                        key={reason}
                        activeOpacity={0.7}
                        onPress={() => setSelectedReason(reason)}
                        style={tw`flex-row items-center gap-x-[12px] py-[12px]`}
                      >
                        <View
                          style={[
                            tw`w-[20px] h-[20px] rounded-full border-[1.5px] items-center justify-center`,
                            { borderColor: selectedReason === reason ? colors.secondary : colors.line },
                          ]}
                        >
                          {selectedReason === reason && (
                            <View style={[tw`w-[10px] h-[10px] rounded-full`, { backgroundColor: colors.secondary }]} />
                          )}
                        </View>
                        <Text style={[typography.bodySm, { color: colors.primary }]}>{reason}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* 상세 사유 입력 */}
                  <TextInput
                    value={detail}
                    onChangeText={(t) => setDetail(t.slice(0, 500))}
                    placeholder="상세 사유를 입력해주세요 (선택)"
                    placeholderTextColor={colors.disabled}
                    multiline
                    style={[
                      tw`h-[100px] rounded-[8px] px-[14px] py-[12px] text-[14px]`,
                      {
                        borderWidth: 1,
                        borderColor: colors.line,
                        fontFamily: fontFamily.regular,
                        color: colors.primary,
                        textAlignVertical: 'top',
                      },
                    ]}
                  />
                  <Text style={[tw`text-right mt-[4px] text-[12px]`, { color: colors.disabled, fontFamily: fontFamily.regular }]}>
                    {detail.length}/500
                  </Text>

                  {submitError && (
                    <Text style={[typography.bodySm, { color: colors.danger, marginTop: 8, textAlign: 'center' }]}>
                      신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.
                    </Text>
                  )}

                  {/* 제출 버튼 */}
                  <TouchableOpacity
                    activeOpacity={selectedReason ? 0.7 : 1}
                    disabled={!selectedReason || isPending}
                    onPress={handleSubmit}
                    style={[
                      tw`mt-[16px] h-[42px] rounded-[5px] items-center justify-center`,
                      { backgroundColor: selectedReason ? colors.primary : colors.disabled },
                    ]}
                  >
                    {isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={[typography.bodySm, { color: colors.background }]}>신고 접수</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
