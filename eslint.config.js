// ESLint v9 flat config — Expo 공식 룰셋(eslint-config-expo) 기반.
// 생성물/설정 파일은 린트 대상에서 제외한다.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.expo/**',
      'backend-context/**',
      'src/types/api.ts', // openapi-typescript 생성물 (11.8k줄) — 린트하지 않음
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
    ],
  },
  ...expoConfig,
  {
    // react-hooks v6(react-compiler 기반) 규칙은 PanResponder ref·effect 내 상태 리셋 등
    // 기존 RN 패턴을 광범위하게 잡는다(FilterModal/ReserveTimeBar/SnapDetail 등). 게이트
    // 도입 단계에선 warn으로 가시화만 하고, 거대 컴포넌트 분해(로드맵 P4) 때 error로 복원한다.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
