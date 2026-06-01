#!/usr/bin/env bash
# 병렬 실행관: work-order를 격리된 git worktree + 전용 브랜치에서 실행한다.
# 독립 이음매를 동시에 진행해도 작업트리가 충돌하지 않는다.
# 여러 개를 동시에 돌리려면 각각 run_in_background로 호출하면 된다.
#
# 사용법:
#   scripts/codex-worktree.sh <work-order.md> [executor: codex|gemini] [name]
#
# 실행 후: 사령관이 worktree에서 검증/리뷰한 뒤 브랜치를 머지한다.
#   cd .worktrees/<name> && bash ../../scripts/verify.sh <work-order>
#   git merge wt/<name>     (메인 트리에서)
#   git worktree remove .worktrees/<name>
set -euo pipefail
cd "$(dirname "$0")/.." || exit 2
export PATH="$PATH:${HOME:-}/AppData/Roaming/npm:$(npm config get prefix 2>/dev/null || true)"

WO="${1:?work-order 파일 경로가 필요합니다}"
EXECUTOR="${2:-codex}"
NAME="${3:-$(basename "$WO" .md)}"
WT_DIR=".worktrees/$NAME"
BRANCH="wt/$NAME"

[ -f "$WO" ] || { echo "work-order 없음: $WO" >&2; exit 1; }
WO_ABS="$(cd "$(dirname "$WO")" && pwd)/$(basename "$WO")"

if git worktree list | grep -q "$WT_DIR"; then
  echo "worktree가 이미 존재합니다: $WT_DIR (정리: git worktree remove $WT_DIR)" >&2; exit 1
fi
git worktree add -b "$BRANCH" "$WT_DIR" HEAD
WT_ABS="$(cd "$WT_DIR" && pwd -W 2>/dev/null || (cd "$WT_DIR" && pwd))"
echo ">> worktree 생성: $WT_DIR (branch $BRANCH) → $WT_ABS" >&2

OUT="ops/codex/reports/$NAME.md"; mkdir -p "$(dirname "$OUT")"

case "$EXECUTOR" in
  codex)
    echo ">> Codex 실행관 디스패치 (gpt-5.5/xhigh)" >&2
    codex exec -C "$WT_ABS" -m gpt-5.5 -c model_reasoning_effort="xhigh" \
      --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
      -o "$WT_ABS/../../$OUT" - < "$WO_ABS"
    ;;
  gemini)
    # 주의: Gemini는 폴더 trust가 per-folder다. 새 worktree 경로를 먼저 trust해야 yolo가 자동수정한다.
    echo ">> Gemini 실행관 디스패치 (yolo) — worktree 폴더 trust 필요할 수 있음" >&2
    ( cd "$WT_DIR" && gemini -p "이 저장소의 AGENTS.md 계약을 준수하여 다음 work-order를 수행하라:
$(cat "$WO_ABS")" --approval-mode yolo | tee "$OLDPWD/$OUT" )
    ;;
  *) echo "알 수 없는 executor: $EXECUTOR (codex|gemini)" >&2; git worktree remove --force "$WT_DIR"; exit 1 ;;
esac

echo "" >&2
echo "==== 완료. 다음: ====" >&2
echo "  cd $WT_DIR && bash $(pwd)/scripts/verify.sh $WO_ABS   # 게이트" >&2
echo "  (메인) git merge $BRANCH && git worktree remove $WT_DIR" >&2
