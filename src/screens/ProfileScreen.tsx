import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const MOCK_POSTS = Array.from({ length: 9 });

const STATS = [
  { value: '00', label: '게시물' },
  { value: '00', label: '팔로워' },
  { value: '00', label: '팔로잉' },
];

const ACTIONS = [
  { icon: 'ticket-outline' as const, label: '쿠폰함' },
  { icon: 'chatbox-outline' as const, label: '문의하기' },
  { icon: 'heart-outline' as const, label: '좋아요' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Top Bar */}
      <View style={tw`flex-row items-center justify-between px-[20px] h-[54px] bg-white`}>
        <Text style={tw`font-semibold text-[14px] text-[#6F6F6F]`}>프로필</Text>
        <View style={tw`flex-row items-center gap-[10px]`}>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={27} color="#6F6F6F" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={27} color="#6F6F6F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Profile */}
        <View style={tw`py-[20px] gap-y-[15px]`}>
          {/* Profile image + stats */}
          <View style={tw`flex-row items-center px-[20px] gap-[40px]`}>
            <View style={tw`w-[59px] h-[59px] rounded-full bg-[#D9D9D9]`} />
            <View style={tw`flex-row items-center gap-[63px]`}>
              {STATS.map(({ value, label }) => (
                <View key={label} style={tw`items-center gap-y-[9px] w-[34px]`}>
                  <Text style={tw`font-semibold text-[18px] text-[#6F6F6F]`}>{value}</Text>
                  <Text style={tw`font-medium text-[12px] text-[#6F6F6F]`}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Name + bio */}
          <View style={tw`px-[20px] gap-y-[9px]`}>
            <Text style={tw`font-semibold text-[18px] text-[#6F6F6F]`}>사용자</Text>
            <Text style={tw`font-medium text-[12px] text-[#6F6F6F]`}>안녕하세요 자기소개입니다</Text>
          </View>

          {/* Edit / Share buttons */}
          <View style={tw`flex-row px-[20px] gap-[26px]`}>
            {['프로필 수정', '프로필 공유'].map((label) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.7}
                style={tw`flex-1 h-[35px] bg-[#D9D9D9] rounded-[5px] items-center justify-center`}
              >
                <Text style={tw`font-bold text-[12px] text-[#6F6F6F]`}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action shortcuts card */}
        <View style={tw`px-[10px] pb-[5px]`}>
          <View
            style={[
              tw`bg-white rounded-[10px] h-[84px] flex-row items-center justify-evenly px-[20px]`,
              {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 1.5,
                elevation: 3,
              },
            ]}
          >
            {ACTIONS.map(({ icon, label }) => (
              <TouchableOpacity key={label} activeOpacity={0.7} style={tw`items-center w-[38px]`}>
                <Ionicons name={icon} size={35} color="#6F6F6F" />
                <Text style={tw`font-medium text-[8px] text-[#6F6F6F] text-center mt-[2px]`}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Post grid 3×3 */}
        <View style={tw`flex-row flex-wrap mt-[5px]`}>
          {MOCK_POSTS.map((_, i) => (
            <View
              key={i}
              style={{
                width: '33.33%',
                aspectRatio: 1,
                backgroundColor: '#D9D9D9',
                borderWidth: 1,
                borderColor: 'white',
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
