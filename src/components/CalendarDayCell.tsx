import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';

interface CalendarDayCellProps {
  day: number;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

// Figma: Callender 컴포넌트(Day, 350:2867 등) — 42.606px 원형 셀
export default function CalendarDayCell({ day, selected = false, disabled = false, onPress }: CalendarDayCellProps) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onPress?.()}
      activeOpacity={disabled ? 1 : 0.7}
      style={{ width: '14.28%', alignItems: 'center' }}
    >
      <View
        style={[
          { width: 42.606, height: 42.606, borderRadius: 19.308, alignItems: 'center', justifyContent: 'center' },
          selected && { backgroundColor: colors.secondary },
        ]}
      >
        <Text
          style={{
            fontSize: 15.45,
            lineHeight: 22.066,
            fontFamily: fontFamily.regular,
            color: selected ? colors.background : disabled ? colors.primary10 : colors.secondary,
          }}
        >
          {day}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
