import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import tw from 'twrnc';
import { RootStackParamList } from '../types';
import { colors, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <View style={{ height: 54, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={[typography.headingMd, { color: colors.secondary, flex: 1, textAlign: 'center', marginRight: 24 }]}>
          찜한 디자인
        </Text>
      </View>

      <View style={tw`flex-1 items-center justify-center`}>
        <Ionicons name="heart-outline" size={48} color={colors.secondary50} />
        <Text style={[typography.bodySm, { color: colors.secondary50, marginTop: 12 }]}>
          준비 중이에요
        </Text>
      </View>
    </SafeAreaView>
  );
}
