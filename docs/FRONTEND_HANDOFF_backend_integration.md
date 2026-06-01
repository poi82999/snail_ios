# 프론트 작업자 핸드오프 — 백엔드 계약 연동

> 작성: 2026-06-02 / 기준: `backend-context/openapi.json` (커밋된 스펙 원문)
> 핵심: 백엔드 계약은 **이미 확정**돼 있고, 데이터 레이어(타입·API 매핑·예약 payload 변환)는 **연동 완료**했습니다. 남은 건 **화면 UI 배선 + 로그인 + 디바이스 검증**입니다.

---

## 0. 받았던 메모 정정 (중요)

대조해보니 사전 메모 일부가 실제 스펙과 달랐습니다. **아래가 정답입니다.**

| 항목 | 메모 | 실제 스펙(openapi.json) |
|---|---|---|
| 디자인 목록 | `GET /designs` 없음, `/feed`·`/designs/search` 써야 함 | **`GET /api/v1/designs` 존재** ([7008](../backend-context/openapi.json#L7008)). `/feed` 없음 → 프론트 현행이 맞음 |
| 슬롯 엔드포인트 | `GET /designers/:id/slots` | **`GET /api/v1/designs/{design_id}/availability`** ([11162](../backend-context/openapi.json#L11162)). 디자인 기준. `bookingApi.ts`가 이미 정답 경로 사용 |
| 슬롯 필드 | `start_datetime`, `local_time_label`("11:00"), `available`, `available_designer_count` | **`start_at` / `end_at` / `available_designer_ids` 3개뿐** ([14582](../backend-context/openapi.json#L14582)). 표시용 라벨 없음 → 프론트가 직접 포맷 |
| 예약 시간 필드 | `start_datetime` | **`start_at`** |
| 예약 메모 필드 | `user_request_memo` | **`user_request`** (≤200자) |
| 디자이너 소스 | 별도 API 필요? | 디자인 상세에 `designers` 임베드 + 공개 엔드포인트 둘 다 있음 |

---

## 1. 백엔드 계약 요약 (Q/A)

### 로그인
- `POST /api/v1/auth/apple`, `POST /api/v1/auth/refresh`
- 응답 `AppleSignInResponse` = `{ tokens: TokenPair, user }`, 토큰이 `tokens`로 감싸짐
- `TokenPair` (전부 required): `access_token`, `refresh_token`, `token_type:"Bearer"`, `access_expires_at`, `refresh_expires_at`(ISO date-time)

### 예약 `POST /api/v1/reservations` — `ReservationCreate`
```jsonc
{
  "design_id": "uuid",          // required
  "start_at": "ISO 8601 UTC",   // required  (슬롯 start_at 그대로)
  "designer_id": "uuid | null",
  "selected_option_ids": ["uuid", ...],  // 제거+연장+케어 합친 배열
  "user_request": "string(≤200) | null"
}
```

### 슬롯 `GET /api/v1/designs/{design_id}/availability?date=&option_ids=` — `AvailableSlot[]`
```jsonc
{ "start_at": "ISO", "end_at": "ISO", "available_designer_ids": ["uuid", ...] }
```

### 옵션 `DesignOptionPublic` (디자인 상세에 임베드)
`id`(uuid) · `kind`(`extend`|`removal`|`care`) · `name` · `price_delta` · `duration_delta_min` · `sort_order` · `is_active`

### 디자이너 `DesignDesignerPublic` (디자인 상세에 임베드)
`id` · `shop_id` · `name` · `position?` · `profile_image_url?` · `specialty_tags[]`
> ⚠️ 근무시간(workStart/workEnd)·예약된 슬롯 정보는 **없음**. 가용 시간은 `availability` 슬롯으로만 판단.

### 이미지 `DesignImagePublic`
`original_url`(required) · `processed_url?`(가공본/WebP) · `is_thumbnail` · `sort_order`. 표시는 `processed_url ?? original_url`.

---

## 2. ✅ 완료된 것 (데이터 레이어 — tsc 통과)

| 파일 | 변경 |
|---|---|
| `src/types/index.ts` | `DesignOption`, `Designer`, `DesignOptionKind` 타입 추가. `DesignDetail`에 `designers: Designer[]`, `options: DesignOption[]` 추가 |
| `src/api/designDetailApi.ts` | 응답의 `designers`/`options`(활성만) 매핑해서 내려줌 → **MOCK 제거 가능** |
| `src/api/bookingApi.ts` | `AvailableSlot` 타입 export, `buildReservationPayload(selection)` 헬퍼 추가 — 옵션 배열 합치기 + `start_at` 단일화를 한 곳에서 처리 |

→ 즉 화면에서 `useDesignDetail(id).data.options` / `.designers`를 바로 쓰면 되고,
예약은 `buildReservationPayload({...})` → `useCreateReservation().mutate(payload)` 로 끝납니다.

---

## 3. 🔧 프론트 작업자 TODO

### T1. 예약 옵션 화면 — MOCK_OPTIONS 제거
- 파일: `src/screens/BookingScreen.tsx` (`MOCK_OPTIONS` 3개 화면에 중복 정의됨: Booking/BookingDate/BookingTime)
- `design.options`를 `kind`로 그룹핑: `removal` → "제거" 섹션, `extend` → "연장" 섹션, `care` → (신규 "케어" 섹션 추가 검토)
- 라디오 UI는 그대로 두고 데이터 소스만 교체. 옵션 `id`가 **실제 UUID**가 되므로 이후 `selected_option_ids`에 그대로 사용
- 가격/시간은 `priceDelta`/`durationDelta` 사용
- 선택한 옵션 UUID들을 다음 화면으로 전달 (네비 파라미터 변경 필요, T4 참조)

### T2. 예약 시간 화면 — MOCK_DESIGNERS + 슬롯 그리드 재작업 ⭐가장 큰 작업
- 파일: `src/screens/BookingTimeScreen.tsx`
- `MOCK_DESIGNERS` 제거 → `design.designers` 사용 (카드 UI 매핑: `name`, `position`/`specialtyTags`→소개, `profileImageUri`→이미지)
- **현재 슬롯 그리드(디자이너별 근무시간 기반)는 API 모델과 안 맞음.** API는 디자인+날짜 기준 `AvailableSlot[]`만 줌. 재설계 필요:
  - `useAvailability(designId, date, optionIds)` 로 슬롯 조회 (이미 hook 존재, 현재 미사용)
  - 슬롯을 선택형 시간 칩으로 렌더 (`start_at` → 로컬 시간 라벨 직접 포맷, 스펙에 라벨 없음)
  - 디자이너 선택은 선택한 슬롯의 `available_designer_ids`로 필터링하는 방식으로 전환 (디자이너→시간 순서 재고)
  - ⚠️ UI/UX 설계 판단 필요 — DESIGN.md 확인하고 진행
- `date`는 ISO `YYYY-MM-DD` 포맷으로. 현재 `BookingDateScreen`의 `dateKey`가 zero-pad 안 됨 (`${year}-${month}-${d}`) → 수정 필요

### T3. 예약 확정 — 실제 생성 호출
- 파일: `src/screens/BookingConfirmScreen.tsx` (현재 성공 화면만, **예약 생성 안 함**)
- 선택값으로 `buildReservationPayload({ designId, startAt: slot.start_at, designerId, selectedOptionIds })` 생성
- `useCreateReservation().mutate(payload)` 호출 → 성공 시 현재 완료 UI, 실패 시 에러 처리
- `start_at`은 슬롯의 `start_at` 그대로 (date+time 합치지 말 것), 옵션은 UUID 배열로

### T4. 네비게이션 파라미터 정비
- 파일: `src/types/index.ts` `RootStackParamList`
- 현재 `removalOptionId`/`extensionOptionId` 단일 → `selectedOptionIds: string[]`로
- `BookingConfirm: undefined` → 예약 payload(선택 슬롯 `start_at`, `designerId`, 옵션 배열 포함) 전달하도록 변경
- 선택한 슬롯/디자이너 정보가 Confirm까지 흘러가야 T3 가능

### T5. 검색 실연동
- 파일: `src/screens/SearchScreen.tsx` (현재 `getMockDesigns` 사용)
- `GET /api/v1/designs` 검색 파라미터 연동 (홈의 `useDesigns` 패턴 재사용, query 텍스트 반영)
- 최근/인기 검색어 하드코딩 → 추후 API (있으면)

### T6. 로그인 + 토큰 영속화
- `POST /auth/apple` 호출부 + 로그인 화면/모달 (CLAUDE.md: 찜/예약/스네일 시 로그인 모달 필수)
- Apple Sign In: `expo-apple-authentication` 등 **신규 의존성/네이티브 설정 필요** (Expo 56 문서 확인)
- 토큰 영속화: 현재 `src/api/authToken.ts`는 **메모리만** → 앱 재시작 시 소실. `expo-secure-store` 도입 필요 (**신규 의존성**)
- `client.ts`의 refresh 인터셉터는 이미 `{tokens}` 래핑/만료 필드 처리됨 → 그대로 사용 가능

### T7. 자잘한 정리
- 홈 좋아요: `useHome.ts`의 `useLikeToggle`이 아직 목 (`POST /designs/{id}/favorite` 실제 연동)
- 디자인 상세 좋아요: 로컬 state만 (`DesignDetailScreen` `isLiked`) → favorite API 연동
- 홈 필터: `designsApi.ts`에서 `void filters`로 무시 중 → 쿼리 파라미터 매핑
- 액션 바 `999+` 하드코딩 카운트
- `snailPosts`/`relatedDesigns`: 디자인 상세 응답에 없음. 전용 엔드포인트 확인 후 연동 (현재 빈 배열)

---

## 4. 권장 순서
1. **T4 → T1 → T3** (예약 생성이 동작하게 — 데모 핵심)
2. **T2** (슬롯 UI 재설계, 가장 무거움)
3. **T5** (검색)
4. **T6** (로그인 — 의존성·네이티브 작업)
5. **T7** (정리)

모든 작업 후 `npx tsc --noEmit` + 에뮬레이터 실기 확인 필수.

---

## 5. ✅ 데이터 레이어 v2 — F-플랜 완료 (2026-06-02, 민석)

백엔드 계약 레이어(`src/api`·`src/hooks`·`src/types`)를 **전부 배선 완료**했습니다. tsc 통과. FE는 아래 **이미 배선된 타입드 훅/함수**를 import해서 UI만 붙이면 됩니다. (백엔드 의존이라던 dev-login/taxonomy는 실제로 존재하지 않아 — dev-login 생략, colors/moods는 한국어 자유문자열로 처리)

| F | 무엇을 쓰면 되나 (FE 소비 지점) |
|---|---|
| **F1 인증** | `useAuth()`→`{user,isAuthenticated,isLoading}`, `useSignInWithApple().mutate({idToken,acceptedTermsVersion,acceptedPrivacyVersion})`, `useSignOut()`. 부트스트랩은 `App.tsx`에 이미 연결됨(`useAuthBootstrap`). FE는 **Apple 버튼 + 로그인 모달 UI**만. (`expo-apple-authentication`으로 id_token 획득은 FE/네이티브 작업) |
| **F2/F3 검색·필터** | `useSearch(filters: SearchFilters)` — `SearchScreen`의 `getMockDesigns` 대체. `SearchFilters = {q,region,colors[],moods[],priceMin,priceMax,durationMax,sort}`. 필터 칩에 **값 선택 UI**를 붙여 `SearchFilters`를 채우면 됨(현재 FilterId 칩은 카테고리만). 홈 필터도 동일 타입. |
| **F4 예약** | `useDisplaySlots(designId,date,optionIds,designerId)`→`DisplaySlot[]`(로컬 `HH:mm` 라벨 + 디자이너 가용 필터 적용). `groupOptionsByKind(design.options)`→`{removal,extend,care}`. 확정: `buildReservationPayload({...})`→`useCreateReservation().mutate(payload)`. **슬롯 그리드 비주얼·레이아웃은 T2(FE 몫).** date는 ISO `YYYY-MM-DD`. |
| **F5 찜** | `useLikeToggle().mutate({designId,isLiked})` — 낙관적 업데이트+롤백 자동. **비로그인 시 `mutation.error`가 `ApiError(code:'UNAUTHORIZED')`** → 이걸로 로그인 모달 트리거. |
| **F6 에러** | `import { getErrorMessage } from '../api/errors'`. `catch`/`mutation.error`를 `getErrorMessage(err)`에 넣어 **그대로 표시**(코드별 한국어, 폴백 포함). 필드오류는 `getFieldErrorMessage(err)`. |
| **F7 무한스크롤** | `useInfiniteDesigns(tab,filters?)` / `useInfiniteSearch(filters)` — `.designs`(평탄화 배열) 바로 사용, FlatList `onEndReached`에서 `fetchNextPage()`, `hasNextPage` 가드. |
| **F8 env** | 베이스URL 자동 분기(iOS/Android/prod). 실기기 로컬백엔드는 `EXPO_PUBLIC_API_BASE_URL`로 오버라이드. 타입 재생성: `npm run gen:api`. |

> 남은 T1~T7은 **순수 UI 배선**(데이터 소스를 위 훅으로 교체 + 로그인/슬롯 그리드 비주얼)만 남았습니다.
