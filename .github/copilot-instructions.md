# Snail iOS — GitHub Copilot Instructions

이 프로젝트는 네일 예약 + 커뮤니티 플랫폼 Snail의 iOS 유저 앱입니다.

## 백엔드 API

API 관련 코드 작성 시 `backend-context/` 폴더의 파일을 참조하세요:
- `backend-context/frontend_app.ai.txt` — 유저 앱 전용 API 번들
- `backend-context/api_cookbook.ai.txt` — 작업별 API 호출 레시피
- `backend-context/openapi.json` — 전체 OpenAPI 스펙

## 필수 규칙

- 인증: `Authorization: Bearer <token>` 헤더
- 변이 요청에 `Idempotency-Key: <UUID>` 헤더 필수
- 에러 분기: `error.code` 필드 사용
- 페이지네이션: cursor 기반 (`next_cursor` → `cursor`)
- 토큰 만료(401) 시 자동 갱신

## 기술 스택

- Swift 5.10+, iOS 17+, SwiftUI
- MVVM + Clean Architecture
- @Observable ViewModel
- URLSession async/await
- NavigationStack
