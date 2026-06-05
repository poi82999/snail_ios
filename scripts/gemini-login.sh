#!/usr/bin/env bash
# 다계정 함대용: Gemini 계정 프로필을 일회성 로그인한다.
# ⚠ 대화형(브라우저 OAuth)이라 사용자가 자기 터미널에서 직접 실행해야 한다.
#
# 사용법:
#   scripts/gemini-login.sh acct2
#     → 브라우저에서 2번째 Gemini Pro 계정으로 로그인 + 이 폴더 trust.
#       이후 GEMINI_PROFILE=acct2 로 그 계정을 헤드리스 사용 가능.
set -euo pipefail
export PATH="$PATH:${HOME:-}/AppData/Roaming/npm:$(npm config get prefix 2>/dev/null || true)"

PROFILE="${1:?프로필 이름이 필요합니다 (예: acct2)}"
export USERPROFILE="C:\\gemini-profiles\\$PROFILE"
export HOME="/c/gemini-profiles/$PROFILE"
mkdir -p "$HOME"

echo ">> 프로필 '$PROFILE' (홈=$HOME) 대화형 로그인 시작"
echo ">> 'Login with Google' 선택 후 해당 계정으로 인증하고, 이 폴더를 trust 하세요."
gemini
