# 오케스트레이션 시스템 — Opus 사령관 / Codex 실행관

이 저장소의 백엔드 접합·기능 구현은 두 AI의 분업으로 진행한다.

| 역할 | 담당 | 하는 일 |
|---|---|---|
| **사령관** | Opus (Claude Code) | 백엔드 계약 해석 → work-order 작성 → Codex 디스패치 → diff 리뷰 → 타입체크/실행 검증 → 통합 판단 → 커밋 |
| **실행관** | Codex CLI (gpt-5.5, reasoning=xhigh) | work-order 범위 내에서 **실제 파일 수정**. 커밋·범위 외 변경 금지 |

## 디스패치 방법
```bash
# 사령관이 work-order를 작성한 뒤:
scripts/codex-do.sh ops/codex/work-orders/<task>.md
# → Codex가 코드를 수정하고, 최종 보고가 ops/codex/last-report.md 에 캡처됨
```
- Codex 설정: 모델 `gpt-5.5`, reasoning `xhigh`(extra high). ChatGPT 로그인 인증.
- **샌드박스**: 이 Windows 환경에선 Codex 내장 샌드박스가 동작하지 않아 `--dangerously-bypass-approvals-and-sandbox`로 실행한다. 즉 Codex는 승인 없이 명령을 실행하므로, 아래 **안전 루프**가 유일한 통제 수단이다.

## 안전 루프 (매 work-order)
1. **브랜치**: 작업은 항상 전용 브랜치에서. `main` 직접 작업 금지.
2. **좁은 범위**: work-order는 한 번에 하나의 이음매(seam)만. "수정 허용 파일"을 명시(`ALLOWED-FILES` 블록).
3. **자동 게이트**: Codex 실행 직후 `scripts/verify.sh <work-order>` 실행 — git 기준으로 (a) 범위 밖 변경, (b) 의존성 변경, (c) `tsc --noEmit`을 자동 검사하고 PASS/FAIL을 낸다. 그 위에 사령관이 `git diff`로 코드 품질 리뷰 + 필요시 에뮬레이터 렌더 확인.
4. **롤백**: 범위 이탈·오작동 시 `git checkout -- <file>` 또는 `git restore`로 즉시 되돌림.
5. **커밋**: 게이트 통과 + 사용자 승인 후에만 사령관이 커밋.

```bash
# 표준 1사이클
scripts/codex-do.sh ops/codex/work-orders/<task>.md   # 위임
scripts/verify.sh   ops/codex/work-orders/<task>.md   # 자동 게이트
git diff                                              # 사령관 품질 리뷰
```

## 작업 우선순위 (백엔드 접합)
1. axios 클라이언트 기반 (baseURL, JWT/Idempotency-Key/401 refresh 인터셉터)
2. `openapi.json` → 타입 정합 (`src/types`)
3. 홈/검색 디자인 목록 (`src/api`, `src/hooks/useHome` mock 제거)
4. 디자인 상세 (`useDesignDetail`)
5. 예약 플로우 (생성·시간/날짜 조회)
6. 화면 상태처리: 로딩 스켈레톤 / 빈 상태 / 에러 재시도

## 파일 안내
- `AGENTS.md` — Codex가 매 실행 시 자동 로드하는 운영 계약 (규칙의 단일 출처)
- `CLAUDE.md` — 사령관(Opus)용 프로젝트 컨텍스트
- `ops/codex/work-order-template.md` — work-order 양식
- `ops/codex/work-orders/` — 실제 발행한 work-order (감사 추적)
- `scripts/codex-do.{sh,ps1}` — 디스패치 래퍼
