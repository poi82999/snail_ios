# Work Order 01: axios 클라이언트 + 인증 인터셉터 기반

> 사령관(Opus) 발행. `AGENTS.md` 계약을 우선 적용하라.

## 목표
모든 백엔드 호출의 토대가 될 axios 클라이언트를 만든다. JWT Bearer 부착, 변이 요청 Idempotency-Key, 401 시 토큰 갱신·재시도를 인터셉터로 처리한다. **이번 작업은 의존성 추가 없이** 메모리 토큰 저장만 사용한다(영속 저장은 다음 work-order).

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/client.ts` (신규)
- `src/api/authToken.ts` (신규)
- `src/api/errors.ts` (신규)

<!-- ALLOWED-FILES-START
src/api/client.ts
src/api/authToken.ts
src/api/errors.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `backend-context/frontend_app.ai.txt` 의 상단 공통 규약 + 인증 흐름(로그인/refresh) + 에러 코드 표
- `src/types/index.ts` (기존 타입 스타일 참고)
- 기존 `axios` 사용 패턴이 주석으로 있는 `src/hooks/useHome.ts`, `src/api/designDetailApi.ts`

## 계약 (backend-context 기준)
- Base URL(개발): `http://localhost:8000/api/v1`. **상수로 정의하되, Android 에뮬레이터에서는 `localhost`가 `10.0.2.2`여야 함**을 주석으로 남겨라. (env 분기는 이번 범위 밖 — 단일 상수 + 주석이면 충분)
- 인증: `Authorization: Bearer <access_token>`.
- 변이(`POST/PUT/PATCH/DELETE`)에 `Idempotency-Key: <uuid-v4>` 헤더. **uuid는 의존성 없이** 인라인 v4 생성 함수로 만든다.
- 401 응답 시: `POST /auth/refresh` (body에 refresh_token)로 새 토큰쌍을 받아 저장하고 원요청을 1회 재시도. 동시 다발 401에 대해 **single-flight**(갱신 1회만 수행하고 나머지는 그 결과를 대기)로 처리. refresh 실패(예: `INVALID_REFRESH_TOKEN`)면 토큰을 비우고 에러를 그대로 던진다.
- 응답 토큰 구조: `{ tokens: { access_token, refresh_token, token_type, ... } }` 형태(번들 예시 참조).
- 에러: 응답 바디의 `error.code`를 추출해 `ApiError`로 정규화(`code`, `message`, `status` 보관).

## 작업 단계
1. `src/api/authToken.ts`: 메모리 토큰 스토어. `getAccessToken()`, `getRefreshToken()`, `setTokens({access, refresh})`, `clearTokens()` 제공.
2. `src/api/errors.ts`: `ApiError` 클래스/타입 + axios 에러를 `ApiError`로 변환하는 헬퍼.
3. `src/api/client.ts`: axios 인스턴스 + 요청/응답 인터셉터(위 계약). 인라인 uuid v4 포함. default export 또는 named `apiClient`.

## 절대 하지 말 것
- 의존성 추가 (`expo-secure-store`, `async-storage`, `uuid` 등 금지 — 인라인으로 해결)
- `src/screens/`, `src/components/`, 네비게이션, 기존 mock 함수 변경
- git 커밋/브랜치 조작

## 완료 조건
- [ ] `npx tsc --noEmit` 에러 0
- [ ] `apiClient`가 baseURL/Bearer/Idempotency-Key 인터셉터를 갖춤
- [ ] 401 → refresh → 재시도가 single-flight로 구현됨
- [ ] 새 의존성 0개 (package.json 변경 없음)
- [ ] 보고: 수정 파일 목록 + 요약 + 남은 우려(특히 토큰 영속화 후속)
