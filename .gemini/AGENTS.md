# Snail iOS — AI Agent Instructions

이 프로젝트는 네일 예약 + 커뮤니티 플랫폼 **Snail**의 iOS 유저 앱입니다.

## 백엔드 API 컨텍스트

이 레포의 `backend-context/` 폴더에 백엔드 API 명세가 동기화되어 있습니다.
**반드시 아래 파일들을 참조하여 API 호출 코드를 작성하세요.**

### 필수 참조 파일 (우선순위 순)

1. **`backend-context/frontend_app.ai.txt`** — 유저 앱 전용 API 번들
   - 인증 흐름 (Apple Sign In → JWT)
   - 디자인 검색, 예약, 리뷰, 스네일 커뮤니티 전체 API
   - 요청/응답 예시, 에러 코드, Enum 값 포함
   - **화면 구현 시 이 파일을 가장 먼저 읽으세요**

2. **`backend-context/api_cookbook.ai.txt`** — 작업지향 레시피
   - "검색 → 예약 생성" 같은 end-to-end 흐름
   - 복붙 가능한 요청/응답 시퀀스

3. **`backend-context/openapi.json`** — 전체 OpenAPI 3.1 스펙
   - 타입 자동 생성 시 사용
   - 모든 엔드포인트, 스키마, 에러 정의 포함

4. **`backend-context/local_onboarding.md`** — 로컬 개발 환경 가이드
   - Base URL, CORS, 개발 토큰 정보

### 동기화

```bash
# macOS
./scripts/sync-backend-docs.sh

# Windows
.\scripts\sync-backend-docs.ps1
```

## 아키텍처 규칙

- **MVVM + Clean Architecture**: Presentation → Domain → Data 레이어 분리
- **Swift 5.10+**, **iOS 17+**, **SwiftUI** 기반
- **@Observable** 패턴으로 ViewModel 구현
- **NavigationStack** 기반 네비게이션
- 외부 의존성 최소화 (Apple 내장 프레임워크 우선)

## API 연동 규칙

1. 모든 인증 요청에 `Authorization: Bearer <token>` 헤더를 포함하세요.
2. `POST/PUT/PATCH/DELETE` 요청에는 반드시 `Idempotency-Key: <UUID>` 헤더를 포함하세요.
3. 에러 응답은 `error.code` 필드로 분기 처리하세요 (에러 코드 목록은 `frontend_app.ai.txt` 참고).
4. 페이지네이션은 cursor 기반입니다. 응답의 `next_cursor`를 다음 요청의 `cursor` 파라미터로 전달하세요.
5. 토큰 만료(401) 시 `POST /auth/refresh`로 자동 갱신하세요.

## 프로젝트 구조

- `docs/ARCHITECTURE.md` — 상세 아키텍처 설명
- `Configs/` — xcconfig 환경 변수
- `.swiftlint.yml` — 코드 스타일 규칙

## 코드 스타일

- SwiftLint 규칙 준수
- 한국어 주석 사용 (비즈니스 로직)
- Conventional Commits 형식 (`feat:`, `fix:`, `refactor:` 등)
