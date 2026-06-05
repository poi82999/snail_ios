#!/usr/bin/env bash
# 백엔드 OpenAPI 스펙 → TS 타입 생성 (deterministic, AI 아님).
# 모든 실행관이 공유하는 단일 타입 계약. backend-context 동기화 후 재생성한다.
#
# 사용법: scripts/gen-api-types.sh
# 의존성: 충돌(typescript 6 peer) 회피를 위해 npx로 실행 — 별도 설치 불필요.
set -euo pipefail
cd "$(dirname "$0")/.." || exit 2

SRC="backend-context/openapi.json"
OUT="src/types/api.ts"

[ -f "$SRC" ] || { echo "OpenAPI 스펙이 없습니다: $SRC (scripts/sync-backend-docs로 먼저 동기화)" >&2; exit 1; }

echo ">> $SRC → $OUT 생성 중..."
npx --yes openapi-typescript "$SRC" -o "$OUT"
echo ">> 완료. 타입 검증:"
npx tsc --noEmit && echo "✓ tsc 통과"
