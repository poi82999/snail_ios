// RN은 커스텀 폰트에 fontWeight를 적용하지 못한다 (굵기별로 별도 폰트 파일/family).
// 굵기가 필요한 곳은 fontWeight 대신 이 fontFamily 값을 명시해야 한다.
export const fontFamily = {
  thin: 'Pretendard-Thin',
  extralight: 'Pretendard-ExtraLight',
  light: 'Pretendard-Light',
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extrabold: 'Pretendard-ExtraBold',
  black: 'Pretendard-Black',
} as const;

export const fontAssets = {
  'Pretendard-Thin': require('../../assets/fonts/Pretendard-Thin.ttf'),
  'Pretendard-ExtraLight': require('../../assets/fonts/Pretendard-ExtraLight.ttf'),
  'Pretendard-Light': require('../../assets/fonts/Pretendard-Light.ttf'),
  'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.ttf'),
  'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.ttf'),
  'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.ttf'),
  'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.ttf'),
  'Pretendard-ExtraBold': require('../../assets/fonts/Pretendard-ExtraBold.ttf'),
  'Pretendard-Black': require('../../assets/fonts/Pretendard-Black.ttf'),
};
