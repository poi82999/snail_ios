#!/usr/bin/env bash
# 교차 모델 리뷰: Codex가 만든 변경(diff)을 Gemini가 read-only로 검수한다.
# Gemini는 --approval-mode plan 이라 파일을 수정할 수 없다(리뷰 전용). 판정은 사령관(Opus)이 한다.
#
# 사용법:
#   scripts/gemini-review.sh <work-order.md|-> [git-diff-인자...]
#     예) scripts/gemini-review.sh ops/codex/work-orders/01.md            # 작업트리 변경 리뷰
#         scripts/gemini-review.sh ops/codex/work-orders/01.md HEAD~1 HEAD # 특정 커밋 리뷰
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2
export PATH="$PATH:${HOME:-}/AppData/Roaming/npm:$(npm config get prefix 2>/dev/null || true)"

WO="${1:-}"; shift || true
OUT="ops/codex/last-review.md"
mkdir -p "$(dirname "$OUT")"

DIFF="$(git diff "$@")"
if [ -z "$DIFF" ]; then echo "리뷰할 변경(diff)이 없습니다."; exit 0; fi

WO_TEXT="(work-order 없음)"
if [ -n "$WO" ] && [ "$WO" != "-" ] && [ -f "$WO" ]; then WO_TEXT="$(cat "$WO")"; fi

INSTR='너는 시니어 코드 리뷰어다. 아래 WORK ORDER의 의도와 이 저장소 AGENTS.md 계약(스타일링은 twrnc 전용/NativeWind·StyleSheet 금지, HTTP는 src/api·소비는 src/hooks의 React Query 훅, 기존 mock 함수 시그니처 유지, JWT Bearer+변이 Idempotency-Key+401 refresh, 의존성 무단 추가 금지, 화면/네비/테마 무단 변경 금지)에 비춰 DIFF를 검수하라. 파일은 절대 수정하지 마라. 다음 형식으로 간결히 한국어 보고: \n1) 치명 버그(있으면 파일:라인)\n2) 계약/범위 위반\n3) 개선 제안\n4) 종합 판정: PASS 또는 REVISE (+한 줄 사유)\n확실한 것만 적고 추측은 [추측]으로 표시하라.'

echo ">> Gemini 교차 리뷰 중 (read-only)..." >&2
{
  printf '## WORK ORDER\n%s\n\n## DIFF\n```diff\n%s\n```\n' "$WO_TEXT" "$DIFF"
} | gemini -p "$INSTR" --approval-mode plan 2>/dev/null | tee "$OUT"

echo "" >&2
echo "==== 리뷰 저장: $OUT ====" >&2
