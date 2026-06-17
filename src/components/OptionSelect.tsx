import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/tokens';

interface OptionSelectProps {
  selected: boolean;
}

// Figma: OptionSelect (352:3519) — Select/Unselect 라디오 버튼. 테두리는 선택 여부와 무관하게 항상 secondary.
export default function OptionSelect({ selected }: OptionSelectProps) {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected && (
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary }} />
      )}
    </View>
  );
}
