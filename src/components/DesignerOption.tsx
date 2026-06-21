import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Designer } from '../types';
import { colors, shadows, typography } from '../theme/tokens';

interface DesignerOptionProps {
  designer: Designer;
  selected: boolean;
  onPress: () => void;
}

// Figma: Designer 1(선택, 352:3643)/Designer 2(미선택, 352:3648) — 선택 시 카드 전체가
// secondary로 채워지고 이미지에 흰 보더, 텍스트가 흰색으로 바뀐다.
export default function DesignerOption({ designer, selected, onPress }: DesignerOptionProps) {
  const bio = designer.position || designer.specialtyTags.join(' · ');
  const textColor = selected ? colors.background : colors.secondary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[tw`p-[20px] rounded-[10px] flex-row items-center gap-[18px]`, {
        ...shadows.card,
        backgroundColor: selected ? colors.secondary : colors.background,
      }]}
    >
      <Image
        source={{ uri: designer.profileImageUri || undefined }}
        style={[
          { width: 57, height: 57, borderRadius: 10, backgroundColor: colors.line },
          selected && { borderWidth: 1, borderColor: colors.background },
        ]}
        resizeMode="cover"
      />
      <View style={tw`flex-1 gap-y-[6px]`}>
        <Text style={[typography.bodyMd, { color: textColor }]}>{designer.name}</Text>
        {bio ? <Text style={[typography.caption, { color: textColor }]}>{bio}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}
