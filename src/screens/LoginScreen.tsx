import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from 'twrnc';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { colors } from '../theme/tokens';
import { fontFamily } from '../theme/fonts';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

  function goToMain() {
    navigation.replace('Main');
  }

  return (
    <View style={styles.root}>
      {/* 배경: 어두운 브라운 베이스 + 세미 투명 오버레이 */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <SafeAreaView style={tw`flex-1`} edges={['top', 'bottom']}>
        {/* 로고 — 화면 세로 중앙 */}
        <View style={tw`flex-1 items-center justify-center`}>
          {/* Figma 수치: 프레임 402px 기준 로고 폭 약 139px */}
          <Logo color="white" width={139} />
        </View>

        {/* 하단 버튼 영역 */}
        {/* Figma: 버튼 top 752, 높이 42 → 프레임 874 기준 아래 여백 80px */}
        {/* SafeAreaView bottom edge 적용 후 추가 패딩 46px */}
        <View style={tw`px-[19px] pb-[46px]`}>
          <Button
            label="Google 계정으로 로그인"
            onPress={goToMain}
            style={{ backgroundColor: colors.primary }}
          />
          {/* Figma: 버튼 하단~텍스트 간격 17px */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goToMain}
            style={tw`mt-[17px] items-center`}
          >
            <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.primary10 }}>
              비회원으로 계속하기
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A1208',
  },
  overlay: {
    backgroundColor: 'rgba(125, 105, 93, 0.7)',
  },
});
