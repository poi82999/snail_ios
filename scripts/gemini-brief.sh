#!/usr/bin/env bash
# 역할 A: Gemini 사전소화. 큰 소스(backend-context 번들 등)를 '작업별 1페이지 브리프'로 압축.
# Opus/Codex가 원본(수백KB) 대신 이 브리프를 소비 → 비싼 토큰 절약.
# Gemini는 read-only(plan)이고 추출만 하므로 약한 판단으로 충분하다.
#
# 사용법:
#   scripts/gemini-brief.sh "<작업 설명>" <source-file> [source-file...]
#     예) scripts/gemini-brief.sh "홈 디자인 목록/검색 API 연동" backend-context/frontend_app.ai.txt
#   결과: ops/codex/briefs/<slug>.md  (원본 인용 포함)
set -euo pipefail
cd "$(dirname "$0")/.." || exit 2
export PATH="$PATH:${HOME:-}/AppData/Roaming/npm:$(npm config get prefix 2>/dev/null || true)"

# 다계정 격리: GEMINI_PROFILE=acct2 면 그 계정 프로필로 실행 (병렬 함대용)
if [ -n "${GEMINI_PROFILE:-}" ]; then
  export USERPROFILE="C:\\gemini-profiles\\$GEMINI_PROFILE"
  export HOME="/c/gemini-profiles/$GEMINI_PROFILE"
fi

TASK="${1:?작업 설명이 필요합니다}"; shift
[ "$#" -ge 1 ] || { echo "소스 파일을 1개 이상 지정하세요" >&2; exit 1; }
for f in "$@"; do [ -f "$f" ] || { echo "소스 없음: $f" >&2; exit 1; }; done

SLUG="$(echo "$TASK" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9가-힣-' | cut -c1-40)"
OUT="ops/codex/briefs/${SLUG:-brief}.md"
mkdir -p "$(dirname "$OUT")"

INSTR="너는 컨텍스트 추출기다. 절대 코드를 작성하지 마라. 아래 작업에 '직접 필요한' 정보만 원본에서 뽑아 1페이지 이내 마크다운 브리프로 만들어라. 무관한 내용은 모두 버려라. 각 항목 끝에 (출처: 파일명/섹션) 인용을 붙여 Opus가 싸게 검증할 수 있게 하라.
형식:
## 필요한 엔드포인트
- METHOD 경로 — 핵심 요청 필드 / 핵심 응답 필드
## 관련 에러코드
## 비즈니스 규칙·플로우 주의점
## 매핑할 TS 타입 (src/types/api.ts 기준 이름만; 없으면 '확인필요')
작업: $TASK"

echo ">> Gemini 사전소화: \"$TASK\"  (소스: $*)" >&2
cat "$@" | gemini -p "$INSTR" --approval-mode plan 2>/dev/null | tee "$OUT"
echo "" >&2
echo "==== 브리프 저장: $OUT ====" >&2
