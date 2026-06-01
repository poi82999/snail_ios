# Work Order 02 (F1): 인증 세션 plumbing (Apple 교환 + 토큰 영속화 + 부트스트랩)

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선. 아래 범위 안에서만 작업.

**executor: codex**

## 목표
Apple 로그인 토큰 교환 + 토큰 영속화(expo-secure-store) + 앱 시작 부트스트랩 + `useAuth` 훅을 만든다. FE는 Apple 버튼/로그인 모달 UI만 붙이면 되도록 "이미 배선된 타입드 훅"을 넘긴다.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/authApi.ts` (신규)
- `src/api/authToken.ts`
- `src/hooks/useAuth.ts` (신규)

<!-- ALLOWED-FILES-START
src/api/authApi.ts
src/api/authToken.ts
src/hooks/useAuth.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `src/api/authToken.ts` — 현재 메모리 전용 토큰 저장. **client.ts의 요청 인터셉터가 `getAccessToken()`을 동기로 호출**한다(매우 중요).
- `src/api/client.ts` — refresh 인터셉터가 `setTokens({access,refresh})` 형태를 호출(읽기 전용, 수정 금지). `apiClient` 기본 export.
- `src/api/errors.ts` — `ApiError`, `toApiError`.
- `backend-context/local_onboarding.md` — Apple 요청/응답 형태.

## 백엔드 계약 (발췌 — 스펙 다시 뒤지지 말 것)
- `POST /api/v1/auth/apple` (Idempotency-Key 필수 — client 인터셉터가 자동 부착하므로 직접 안 넣어도 됨)
  - body `AppleSignInRequest` = `{ id_token: string, accepted_terms_version: string, accepted_privacy_version: string, nonce?: string|null }`
  - 응답 `AppleSignInResponse` = `{ tokens: TokenPair, user: UserMe }`
  - `TokenPair` = `{ access_token, refresh_token, token_type:"Bearer", access_expires_at, refresh_expires_at }` (전부 ISO 문자열/문자열)
- `GET /api/v1/me` → `UserMe` (현재 로그인 사용자). 토큰 있을 때만 호출.
- 타입은 `src/types/api.ts`의 `components['schemas']['AppleSignInRequest'|'AppleSignInResponse'|'TokenPair'|'UserMe']`, paths `'/api/v1/auth/apple'`, `'/api/v1/me'`를 근거로 사용.

## 작업 단계
1. `src/api/authToken.ts` 재작성 — **동기 게터 계약 유지**가 핵심:
   - 메모리 캐시(`accessToken`/`refreshToken`)는 그대로 두고 `getAccessToken()`/`getRefreshToken()`/`setTokens()`/`clearTokens()` **동기 시그니처 유지**(client.ts가 의존).
   - `setTokens()`는 메모리 캐시 갱신 + expo-secure-store에 비동기 영속(fire-and-forget, await 강제 안 함). `clearTokens()`는 캐시 비우고 secure-store에서 삭제.
   - 신규 `export async function loadPersistedTokens(): Promise<boolean>` — secure-store에서 읽어 메모리 캐시에 주입, 토큰 있으면 true. (부트스트랩용)
   - expo-secure-store API는 v56 문서 기준: `import * as SecureStore from 'expo-secure-store'` → `getItemAsync(key)`, `setItemAsync(key,value)`, `deleteItemAsync(key)`. access/refresh 각각 별도 key(`'snail.access'`,`'snail.refresh'`).
2. 신규 `src/api/authApi.ts`:
   - `export interface AppleSignInParams { idToken: string; acceptedTermsVersion: string; acceptedPrivacyVersion: string; nonce?: string | null }`
   - `export async function signInWithApple(params): Promise<UserMe>` — `apiClient.post('/auth/apple', {...})` → 응답 `tokens`를 `setTokens({access:access_token, refresh:refresh_token})`로 저장하고 `user` 반환. 에러는 `toApiError`로 정규화.
   - `export async function fetchMe(): Promise<UserMe>` — `apiClient.get('/me')`.
   - `export async function signOut(): Promise<void>` — `clearTokens()`.
   - (dev-login은 백엔드에 **존재하지 않음** — 만들지 말 것.)
3. 신규 `src/hooks/useAuth.ts` (TanStack Query v5만 사용):
   - `useAuthSession()` — `useQuery({ queryKey:['auth','session'], queryFn: async()=> getAccessToken()? await fetchMe() : null })`. 토큰 없으면 null.
   - `useSignInWithApple()` — `useMutation({ mutationFn: signInWithApple, onSuccess: user => queryClient.setQueryData(['auth','session'], user) })`.
   - `useSignOut()` — `useMutation({ mutationFn: signOut, onSuccess: ()=> queryClient.setQueryData(['auth','session'], null) })`.
   - 편의 `useAuth()` — 위를 묶어 `{ user, isAuthenticated, isLoading }` 반환(`user = useAuthSession().data ?? null`).
   - 부트스트랩 훅 `useAuthBootstrap()` — 앱 시작 시 `loadPersistedTokens()`를 1회 실행하고 끝나면 세션 쿼리를 invalidate. 반환 `{ isBootstrapping: boolean }`. (App.tsx 배선은 사령관이 한다 — 여기선 훅만 제공.)

## 절대 하지 말 것
- `App.tsx`/`index.ts`/`client.ts` 수정 / 의존성 추가(expo-secure-store는 **이미 설치됨**) / git 커밋 / 동기 게터를 async로 바꾸기.

## node_modules / 타입체크
- worktree에 `node_modules`가 없을 수 있다. `tsc` 불가 시 코드 정확성에 집중하고 보고만. 최종 검증은 사령관이 메인에서.

## 완료 조건
- [ ] `getAccessToken()`/`getRefreshToken()`/`setTokens()`/`clearTokens()` 동기 시그니처 그대로(client.ts 안 깨짐).
- [ ] `signInWithApple` 성공 시 토큰이 메모리+secure-store에 저장되고 `UserMe` 반환.
- [ ] `loadPersistedTokens()`로 재시작 후 토큰 복원 가능.
- [ ] 보고: 수정 파일 + 요약 + 가정/우려.
