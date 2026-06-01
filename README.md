# 🐌 Snail iOS — 유저 앱

네일 예약 + 커뮤니티 플랫폼 **Snail**의 iOS 유저 앱입니다.

## 핵심 기능

- 🔍 **디자인 검색** — AI 태그, 색상, 분위기, 지역 기반 필터링 + 의미 검색
- 📅 **예약** — 실시간 가용 슬롯 조회 → 예약 생성 → 상태 추적
- 🐌 **스네일 커뮤니티** — 네일 사진 공유, 좋아요, 댓글, 팔로우
- 🗺️ **지도 탐색** — 주변 네일샵 지도 뷰
- ⭐ **리뷰** — 완료된 예약에 대한 리뷰 작성/수정

---

## 개발 환경

| 항목 | 최소 요구 |
|---|---|
| macOS | 14.0 (Sonoma) 이상 |
| Xcode | 16.0 이상 |
| iOS Target | 17.0 이상 |
| Swift | 5.10+ |
| 패키지 매니저 | Swift Package Manager (SPM) |

## 시작하기

```bash
# 1. 레포 클론
git clone https://github.com/poi82999/snail_ios.git
cd snail_ios

# 2. Xcode로 열기
open Snail.xcodeproj
# 또는 SPM workspace 사용 시
open Snail.xcworkspace

# 3. 환경 설정
cp Configs/Development.xcconfig.example Configs/Development.xcconfig
# Development.xcconfig 에서 API_BASE_URL 등 수정

# 4. 빌드 & 실행
# Xcode에서 시뮬레이터 선택 후 ⌘R
```

## 아키텍처

**MVVM + Clean Architecture**

```
┌─────────────────────────────────────┐
│  Presentation (SwiftUI)             │
│  Views + ViewModels (@Observable)   │
├─────────────────────────────────────┤
│  Domain                             │
│  UseCases + Entities + Protocols    │
├─────────────────────────────────────┤
│  Data                               │
│  Repositories + NetworkService      │
│  + DTOs + Mappers                   │
└─────────────────────────────────────┘
```

자세한 아키텍처는 [ARCHITECTURE.md](docs/ARCHITECTURE.md)를 참고하세요.

## 백엔드 API 참조

| 리소스 | URL |
|---|---|
| API 스펙 (GitHub Pages) | https://poi82999.github.io/snail_backend_specification/ |
| OpenAPI JSON | https://poi82999.github.io/snail_backend_specification/openapi.json |
| **유저 앱 AI 컨텍스트** | https://poi82999.github.io/snail_backend_specification/frontend_app.ai.txt |
| API 쿡북 | https://poi82999.github.io/snail_backend_specification/api_cookbook.ai.txt |

> 💡 **AI 코딩 시**: `frontend_app.ai.txt`를 AI 도구에 컨텍스트로 넣으면 인증, 검색, 예약, 커뮤니티 API 호출 코드를 바로 생성할 수 있습니다.

## 환경 변수 (xcconfig)

| 키 | 설명 | Development 기본값 |
|---|---|---|
| `API_BASE_URL` | 백엔드 API 주소 | `http://localhost:8000/api/v1` |
| `BUNDLE_IDENTIFIER` | 앱 번들 ID | `com.snail.app.dev` |

## 브랜치 전략

| 브랜치 | 용도 |
|---|---|
| `main` | 프로덕션 (App Store 배포 기준) |
| `develop` | 통합 브랜치 (기능 머지 → QA) |
| `feature/이슈번호-설명` | 기능 개발 |
| `fix/이슈번호-설명` | 버그 수정 |
| `release/1.0.0` | 릴리스 준비 |

## 코드 스타일

- **SwiftLint** 적용 (.swiftlint.yml 참고)
- 커밋 메시지: [Conventional Commits](https://www.conventionalcommits.org/) 형식
  - `feat:` 새 기능
  - `fix:` 버그 수정
  - `refactor:` 리팩토링
  - `docs:` 문서
  - `test:` 테스트

자세한 기여 가이드는 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 프로젝트 구조 (예정)

```
Snail/
├── App/
│   ├── SnailApp.swift
│   └── ContentView.swift
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── APIEndpoint.swift
│   │   └── TokenManager.swift
│   ├── Auth/
│   │   └── AppleSignInService.swift
│   └── Extensions/
├── Features/
│   ├── Search/
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   └── Models/
│   ├── Reservation/
│   ├── Community/
│   ├── Map/
│   ├── Profile/
│   └── Review/
├── Domain/
│   ├── Entities/
│   ├── UseCases/
│   └── Repositories/ (Protocols)
├── Data/
│   ├── Repositories/ (Implementations)
│   ├── DTOs/
│   └── Mappers/
├── Resources/
│   ├── Assets.xcassets
│   └── Localizable.strings
├── Configs/
│   ├── Development.xcconfig
│   └── Production.xcconfig
└── Tests/
```

## 관련 레포

| 레포 | 설명 |
|---|---|
| [snail_backend_specification](https://github.com/poi82999/snail_backend_specification) | 백엔드 명세서 + API 코드 |
| [snail_owner_web](https://github.com/poi82999/snail_owner_web) | 사장님 관리 웹 |
