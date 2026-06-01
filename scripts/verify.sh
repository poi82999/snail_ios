#!/usr/bin/env bash
# 사령관(Opus) 자동 검증 게이트. Codex 디스패치 직후 실행한다.
# bypass 샌드박스의 유일한 통제 수단이므로 git(진실의 원천) 기준으로 검사한다.
#
# 사용법:
#   scripts/verify.sh [work-order.md]
#     work-order를 주면 그 안의 ALLOWED-FILES 블록 밖 변경을 "범위 위반"으로 표시.
#
# 종료코드: 0=PASS, 1=FAIL
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

WO="${1:-}"
FAIL=0

echo "== 1) 변경 파일 (git 기준) =="
mapfile -t CHANGED < <(git status --porcelain | sed 's/^...//' | grep -v '^$')
if [ ${#CHANGED[@]} -eq 0 ]; then
  echo "  (변경 없음)"
else
  printf '  %s\n' "${CHANGED[@]}"
fi

if [ -n "$WO" ] && [ -f "$WO" ]; then
  echo "== 2) 범위 검증 (work-order: $WO) =="
  mapfile -t ALLOWED < <(awk '/ALLOWED-FILES-START/{f=1;next}/ALLOWED-FILES-END/{f=0}f' "$WO" \
    | sed 's/#.*//; s/^[[:space:]]*//; s/[[:space:]]*$//' | grep -v '^$')
  if [ ${#ALLOWED[@]} -eq 0 ]; then
    echo "  ⚠ work-order에 ALLOWED-FILES 블록이 없음 — 범위 검증 건너뜀"
  else
    echo "  허용 패턴: ${ALLOWED[*]}"
    for f in "${CHANGED[@]}"; do
      ok=0
      for pat in "${ALLOWED[@]}"; do
        # shellcheck disable=SC2254
        case "$f" in $pat) ok=1; break;; esac
      done
      if [ $ok -eq 0 ]; then echo "  ✖ 범위 밖 변경: $f"; FAIL=1; fi
    done
    [ $FAIL -eq 0 ] && echo "  ✓ 모든 변경이 허용 범위 내"
  fi
fi

echo "== 3) 의존성 변경 감지 =="
if git status --porcelain -- package.json package-lock.json | grep -q .; then
  echo "  ⚠ package.json/lock 변경됨 — work-order가 의존성 추가를 허가했는지 직접 확인 필요"
  FAIL=1
else
  echo "  ✓ 의존성 무변경"
fi

echo "== 4) tsc --noEmit =="
if npx tsc --noEmit; then echo "  ✓ 타입 통과"; else echo "  ✖ 타입 에러"; FAIL=1; fi

echo
if [ $FAIL -eq 0 ]; then echo "✅ VERIFY PASS"; else echo "❌ VERIFY FAIL (위 항목 확인)"; fi
exit $FAIL
