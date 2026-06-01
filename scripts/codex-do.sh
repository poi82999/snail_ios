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

# [프로세스 자동화] work-order 선커밋: 디스패치 전에 work-order(및 참조 brief)를 커밋해
# 깨끗한 baseline을 만든다 → 이후 verify.sh가 'Codex가 만든 변경'만 보고 깔끔히 판정한다.
if [ -n "$(git status --porcelain -- "$WO")" ]; then
  echo ">> work-order 미커밋 감지 → 선커밋 (clean baseline)" >&2
  git add "$WO"
  # 같은 작업의 brief가 함께 미커밋이면 같이 커밋 (참조 무결성)
  git add ops/codex/briefs 2>/dev/null || true
  git commit -q -m "chore(wo): $(basename "$WO" .md) 디스패치 전 선커밋" \
    -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" || true
fi
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "⚠ 경고: 작업트리에 미커밋 변경이 남아있음 — verify 범위검증이 오염될 수 있음" >&2
  git status --short >&2
fi

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
