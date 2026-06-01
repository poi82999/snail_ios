# Work Order 03: 디자인 상세 실제 API 연동

> 사령관(Opus) 발행. `AGENTS.md` 계약 우선.

**executor: codex**  <!-- 응답→UI 매핑 + 누락필드 판단 → codex -->

## 목표
`designDetailApi.ts`의 mock `fetchDesignDetail(id)`를 실제 `GET /api/v1/designs/{design_id}` 호출로 교체. **함수 시그니처(`(id: string) => Promise<DesignDetail>`)와 반환 타입 유지** → `useDesignDetail`/화면 무수정으로 동작.

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/designDetailApi.ts` (수정)

<!-- ALLOWED-FILES-START
src/api/designDetailApi.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `ops/codex/briefs/디자인-상세-조회-api-연동.md` (브리프 — 원본 대신)
- `src/types/api.ts` — `paths["/api/v1/designs/{design_id}"]["get"]` 응답 + `components["schemas"]["DesignPublic"]` (ground truth)
- `src/types/index.ts` — `DesignDetail`(목표 반환형: duration/tags/snailPosts/relatedDesigns 포함)
- `src/api/designsApi.ts` — 같은 매핑 패턴(이미지 폴백, 타입가드) 참고. `src/api/client.ts`의 `apiClient` 사용.

## 매핑/범위 지침 (모호성 제거)
- 공통 필드: `shopName←shop.name`, `location←shop.region ?? ''`, `price←base_price`, `likeCount←favorite_count`, `isLiked←favorited_by_me ?? false`, `imageUri`←썸네일/이미지 폴백(designsApi와 동일 로직 재사용/모방).
- `duration ← duration_minutes`, `tags ← ai_tags`(없으면 `[]`), `tab ← []` (상세 응답에 tab 개념 없음).
- **`snailPosts`, `relatedDesigns`는 상세 응답에 직접 대응이 없다 → 빈 배열 `[]` + `// TODO: 별도 엔드포인트 필요` 주석.** 엔드포인트를 지어내지 마라.
- 응답 필드가 `src/types/api.ts`에 불명확하면 추측 말고 가장 합리적 매핑 + TODO 주석.

## 절대 하지 말 것
- `useDesignDetail.ts`/화면/`mockData.ts`/`src/types/*` 수정, 의존성 추가, git 커밋

## 완료 조건
- [ ] `npx tsc --noEmit` 에러 0
- [ ] `fetchDesignDetail`이 `apiClient`로 `/designs/{id}`를 호출하고 `DesignDetail` 반환, 시그니처 불변
- [ ] mock(`MOCK_DETAILS`, `getMockDetail`) 제거
- [ ] 보고: 수정 파일 + 매핑 가정 + 누락필드(snailPosts 등) 후속
