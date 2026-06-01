export const colors = {
  primary:     "#070705",
  primary50:   "#7E7E7D",
  primary10:   "#DDDDDD",
  background:  "#FFFFFF",
  secondary:   "#7D695D",
  secondary50: "#BBAFA8",
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