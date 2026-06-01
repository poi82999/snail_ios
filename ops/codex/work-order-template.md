# Work Order: <제목>

> 사령관(Opus)이 작성하고 디스패치한다. 실행관은 `AGENTS.md` 계약을 우선 적용하며 아래 범위 안에서만 작업한다.

**executor: codex**   <!-- 기본 codex. 아래 보수적 라우팅 규칙을 만족할 때만 gemini -->

<!--
보수적 라우팅 규칙 (약한 모델 오용으로 인한 재작업 방지):
- 기본값은 codex. 자동 휴리스틱 금지 — Opus가 명시적으로만 gemini로 바꾼다.
- gemini는 "기계적+저모호" 이음매에만: 스펙이 완결적이고 설계 판단이 0에 가까울 때
  (예: 정해진 타입으로의 매핑, 보일러플레이트, 픽스처). 알고리즘·상태·에러흐름 설계가
  필요하면 codex.
- gemini 실행분은 verify.sh 통과 + 교차리뷰(다른 Gemini 계정 또는 Opus) 통과가 '필수'.
- gemini가 verify를 2회 실패하면 루프 돌지 말고 codex로 에스컬레이션.
-->


## 목표
<무엇을, 왜. 한두 문장.>

## 수정 허용 파일 (이 목록 밖은 읽기 전용)
- `src/api/<...>.ts`
- `src/hooks/<...>.ts`

<!-- 아래 블록은 scripts/verify.sh가 기계 판독한다. 경로/글롭(예: src/api/*.ts)을 한 줄에 하나씩. -->
<!-- ALLOWED-FILES-START
src/api/<...>.ts
src/hooks/<...>.ts
ALLOWED-FILES-END -->

## 먼저 읽을 것
- `backend-context/frontend_app.ai.txt` 의 <관련 섹션/엔드포인트>
- `src/types/index.ts`
- <기존 동일 패턴 파일>

## 작업 단계
1. <...>
2. <...>

## 절대 하지 말 것
- 화면 컴포넌트(`src/screens/`, `src/components/`)의 JSX/레이아웃 변경
- 의존성 추가
- 함수 시그니처 변경 (mock과 동일하게 유지)

## 완료 조건
- [ ] `npx tsc --noEmit` 통과
- [ ] <대상 함수>가 실제 API를 호출하고 기존 반환 타입을 유지
- [ ] 로딩/에러 상태가 훅에서 정상 전파
- [ ] 보고: 수정 파일 목록 + 요약 + 남은 우려
