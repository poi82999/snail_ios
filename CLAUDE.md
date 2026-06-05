# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Expo Version

**Always read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any Expo-related code.** Expo APIs change significantly between versions and generic knowledge will be wrong.

## Commands

```bash
# Start dev server
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Type check
npx tsc --noEmit

# Lint
npx eslint . --fix
```

## Stack

- **Expo** ~56.0.5 with **React Native** 0.85.3 and **React** 19
- **TypeScript** strict mode
- **twrnc** — 스타일링은 `import tw from 'twrnc'` 후 `` tw`...` `` 형식만 사용. NativeWind className / StyleSheet.create 사용 금지. 토큰은 `tailwind.config.js` 참조 (실제 코드 기준)
- **TanStack Query v5** — 서버 상태 관리, API 호출은 모두 훅으로
- **Axios** — API 통신
- **React Navigation v7** — 네비게이션
- Entry point: `index.ts` → `App.tsx`

## Architecture

- Expo 56 uses the **new architecture** by default (Fabric + JSI) — avoid libraries that rely on the legacy bridge
- 함수형 컴포넌트만 사용. 클래스 컴포넌트 금지
- TypeScript 타입 항상 정의
- Redux, MobX 등 다른 상태관리 라이브러리 사용 금지

## Folder Structure

```
src/
├── screens/       # 화면 컴포넌트
├── components/    # 재사용 컴포넌트
├── hooks/         # React Query 커스텀 훅
├── api/           # API 호출 함수
├── navigation/    # 네비게이션 설정
└── types/         # TypeScript 타입 정의
```

## Design System

- **DESIGN.md** 파일의 수치를 반드시 참조할 것
- 모든 px값, 색상, 폰트는 DESIGN.md 기준
- Tailwind 기본 클래스 사용 금지 (rounded-xl 등)
- 정확한 px값 사용 (rounded-[16px], text-[14px] 형식으로)

## Screen Spec

- **IA_SPEC.md** 참조. 화면별 구조, 상태 변형, 컴포넌트 정의 포함
- AI 태그 절대 노출 X (사장님이 직접 단 태그만)
- 비로그인 상태 처리 필수 (찜/예약/스네일 시 로그인 모달)
- 로딩: 스켈레톤 UI
- 데이터 0: 빈 상태 컴포넌트 + CTA
- 에러: "다시 시도" 버튼

## API

- 베이스 URL: https://api.snail.com/v1
- 인증: JWT Bearer 토큰
- 현재: mock 데이터로 UI 먼저 구현 중

## Development Priority (데모데이 기준)

1. 홈 (HOME-01)
2. 탐색/검색 (SEARCH-01)
3. 디자인 상세 (DESIGN-01)
4. 예약 화면 (BOOKING-01)
5. 일정 + 예약 상세 (SCHEDULE-01/02)
