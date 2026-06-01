#!/usr/bin/env bash
# Opus(사령관) → Codex(실행관) 디스패치 래퍼.
# work-order 파일을 stdin으로 Codex에 넘겨 코드 수정을 위임하고, 최종 보고를 캡처한다.
#
# 사용법:
#   scripts/codex-do.sh <work-order.md> [report-out.md]
#
# 주의: Windows 내장 샌드박스가 동작하지 않아 --dangerously-bypass-approvals-and-sandbox 사용.
#       안전망은 사령관(Opus)이 책임진다: 전용 브랜치 + 좁은 work-order + diff 게이트 + git 롤백.
set -euo pipefail

# npm 전역 bin이 PATH에 없을 수 있으므로 보강
export PATH="$PATH:${HOME:-}/AppData/Roaming/npm:$(npm config get prefix 2>/dev/null || true)"

REPO="C:\projects\snail_ios"
MODEL="gpt-5.5"
EFFORT="xhigh"   # extra high reasoning

WO="${1:?work-order 파일 경로가 필요합니다}"
OUT="${2:-ops/codex/last-report.md}"

[ -f "$WO" ] || { echo "work-order 파일이 없습니다: $WO" >&2; exit 1; }
command -v codex >/dev/null 2>&1 || { echo "codex CLI를 PATH에서 찾을 수 없습니다" >&2; exit 1; }
mkdir -p "$(dirname "$OUT")"

echo ">> Codex 디스패치: $WO  (model=$MODEL, effort=$EFFORT)" >&2
codex exec \
  -C "$REPO" \
  -m "$MODEL" \
  -c model_reasoning_effort="$EFFORT" \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -o "$OUT" \
  - < "$WO"

echo "" >&2
echo "==== Codex 최종 보고 ($OUT) ====" >&2
cat "$OUT" >&2
