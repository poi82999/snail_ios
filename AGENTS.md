# AGENTS.md — Codex 실행관(executor) 운영 계약

이 저장소에서 **너(Codex)는 실행관**이다. 사령관(Opus/Claude)이 work-order를 주면 **그 범위 안에서만** 코드를 수정한다. 이 파일의 규칙은 work-order보다 우선한다.

## 0. 프로젝트
- Snail 네일 예약 앱의 **유저용 모바일 프론트엔드**.
- Expo ~56.0.5 / React Native 0.85.3 / React 19 / **TypeScript strict**.
- 현재 화면은 mock 데이터로 동작한다. **주 미션: 실제 백엔드를 접합해 기능을 매끄럽게 구현하는 것.**
- Expo는 버전마다 API가 크게 다르다. Expo 관련 코드는 반드시 https://docs.expo.dev/versions/v56.0.0/ 의 해당 버전 문서를 확인하고 작성하라. 일반 지식은 틀린다.

## 1. 절대 규칙 (위반 금지)
- **work-order의 "수정 허용 파일" 목록에 있는 파일만 수정한다.** 그 외 파일은 읽기 전용.
- 다음은 work-order가 명시적으로 허가하지 않는 한 절대 건드리지 마라:
  `src/navigation/`, `src/theme/`, `App.tsx`, `index.ts`,
  `package.json` / `package-lock.json`, `tailwind.config.js`, `babel.config.js`, `app.json`, `tsconfig.json`.
- **의존성 추가는 work-order가 지시할 때만.** 임의로 새 패키지를 설치하지 마라.
- **git 커밋·브랜치·푸시 금지.** 변경만 작업트리에 남기고 멈춰라. 커밋은 사령관이 한다.
- 새 상태관리 라이브러리(Redux/MobX/Zustand 등) 도입 금지. 서버 상태는 **TanStack Query v5 훅으로만**.

## 2. 스타일링 (중요 — 자주 틀리는 부분)
- 이 프로젝트는 **`twrnc`**를 쓴다: `import tw from 'twrnc'` 후 `` tw`...` `` 형식.
- **NativeWind `className`, `StyleSheet.create` 사용 금지.**
- 색상·폰트·수치는 `tailwind.config.js`에 정의된 토큰을 쓴다 (예: `` tw`text-primary text-body-md` ``, `` tw`rounded-chip h-chip` ``). 임의 px 하드코딩 전에 토큰이 있는지 확인. 디자인 기준은 `DESIGN.md`.

## 3. 백엔드 접합 규칙
- API 명세는 `backend-context/`에 있다. API 코드 작성 **전에 반드시** 참조:
  1. `backend-context/frontend_app.ai.txt` — 유저앱 API 번들 (가장 먼저 읽어라)
  2. `backend-context/api_cookbook.ai.txt` — end-to-end 흐름 레시피
  3. `backend-context/openapi.json` — 전체 OpenAPI 3.1 스펙 (타입 근거)
- 인증: `Authorization: Bearer <token>`. 변이 요청(POST/PUT/PATCH/DELETE)에 `Idempotency-Key: <UUID>` 헤더 필수.
- 에러는 응답의 `error.code`로 분기. 페이지네이션은 cursor 기반(`next_cursor` → 다음 `cursor`). 401이면 `POST /auth/refresh`로 토큰 갱신.
- 계층: HTTP 호출은 `src/api/`에, 화면이 소비하는 것은 `src/hooks/`의 React Query 훅으로 감싼다.
- **기존 mock 함수의 시그니처(인자·반환 타입)를 유지**하고 본문만 real 호출로 교체하라. 화면 코드가 깨지지 않아야 한다.

## 4. 완료 기준 (매 work-order 공통)
- `npx tsc --noEmit` 가 **에러 0**으로 통과해야 한다.
- work-order에 적힌 "완료 조건"을 모두 충족.
- 마지막 출력에 반드시 포함: **(1) 수정한 파일 목록, (2) 한 일 요약, (3) 가정·남은 우려·후속 필요사항**.

## 5. 코드 스타일
- 함수형 컴포넌트만. 클래스 컴포넌트 금지.
- 비즈니스 로직엔 한국어 주석.
- 타입은 항상 명시. `any` 지양.
