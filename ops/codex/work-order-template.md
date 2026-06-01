# Work Order: <제목>

> 사령관(Opus)이 작성하고 `scripts/codex-do.sh <이 파일>`로 Codex에 전달한다.
> Codex는 `AGENTS.md` 계약을 우선 적용하며, 아래 범위 안에서만 작업한다.

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
