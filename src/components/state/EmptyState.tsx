import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

import { colors, typography } from '../../theme/tokens';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}

// 데이터가 0건일 때 표시하는 공통 빈 상태(아이콘 + 문구 + 선택 CTA, IA_SPEC §5.6).
export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onPressCta,
}: EmptyStateProps) {
  return (
    <View style={tw`flex-1 items-center justify-center px-[40px] gap-[8px]`}>
      {icon && <Ionicons name={icon} size={40} color={colors.secondary50} />}
      <Text style={[typography.bodyMd, { color: colors.secondary, textAlign: 'center' }]}>
        {title}
      </Text>
      {description && (
        <Text style={[typography.bodySm, { color: colors.secondary50, textAlign: 'center' }]}>
          {description}
        </Text>
      )}
      {ctaLabel && onPressCta && (
        <TouchableOpacity
          onPress={onPressCta}
          activeOpacity={0.7}
          style={[
            tw`mt-[12px] px-[24px] h-[40px] rounded-[8px] items-center justify-center`,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Text style={[typography.bodySm, { color: colors.background }]}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
