export const colors = {
  primary:     "#070705",
  primary50:   "#7E7E7D",
  primary10:   "#DDDDDD",
  background:  "#FFFFFF",
  secondary:   "#7D695D",
  secondary50: "#BBAFA8",
  // 화면 전반에서 반복되던 의미색(값 동일, 중복 제거용)
  text:        "#6F6F6F", // 본문/라벨 기본 텍스트
  line:        "#E5E5E5", // 구분선/입력 보더
  disabled:    "#D9D9D9", // 비활성 배경/플레이스홀더
  danger:      "#FF6B6B", // 에러/하트
} as const;

// iOS 그림자 + Android elevation 프리셋. 인라인 중복(shadowColor/Offset/Opacity...) 제거용.
export const shadows = {
  card:   { shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 3.78, elevation: 3 },
  bar:    { shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 3 },
  subtle: { shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 },
} as const;

export const typography = {
  headingLg: {
    fontSize:   20,
    lineHeight: 28,
    fontWeight: "700" as const,
  },
  headingMd: {
    fontSize:   18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  bodyMd: {
    fontSize:   16,
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  bodySm: {
    fontSize:   14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  filter: {
    fontSize:   14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },
  caption: {
    fontSize:   12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  20,
  xl:  24,
} as const;

export const radius = {
  chip: 16,
} as const;

export const chip = {
  height:      32,
  paddingV:    8,
  paddingH:    16,
  borderWidth: 1,
  gapNon:      4,
  gapSel:      12,
} as const;