# 🏗️ Snail iOS 아키텍처

## 레이어 구조

```
┌──────────────────────────────────────────────┐
│              Presentation Layer               │
│                                              │
│  SwiftUI Views ← ViewModels (@Observable)    │
│  NavigationStack / Sheet / Alert             │
├──────────────────────────────────────────────┤
│               Domain Layer                    │
│                                              │
│  UseCases (비즈니스 규칙)                      │
│  Entities (도메인 모델)                        │
│  Repository Protocols (추상화)                │
├──────────────────────────────────────────────┤
│                Data Layer                     │
│                                              │
│  Repository Implementations                  │
│  NetworkService (URLSession)                 │
│  DTOs + Mappers                              │
│  Local Storage (UserDefaults / Keychain)     │
└──────────────────────────────────────────────┘
```

### 의존성 규칙

- **Presentation → Domain**: ViewModel은 UseCase를 주입받아 사용
- **Domain → Data**: Domain은 Repository Protocol만 알고, 구현체는 모름
- **Data → 외부**: Data 레이어만 네트워크, DB 등 외부 의존성을 가짐

---

## 네트워킹

### APIClient

`URLSession` 기반의 제네릭 API 클라이언트:

```swift
// 개략적 구조
final class APIClient {
    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T
}
```

- **Base URL**: xcconfig에서 주입 (`API_BASE_URL`)
- **인증**: `TokenManager`가 access/refresh 토큰 관리
- **토큰 갱신**: 401 응답 시 자동으로 refresh → 원래 요청 재시도
- **멱등성**: 변이 요청에 `Idempotency-Key` 헤더 자동 생성 (UUID)
- **에러 처리**: 서버 에러 응답을 `AppError` enum으로 변환

### OpenAPI 타입 자동 생성 (선택)

`openapi.json`에서 Swift 타입을 자동 생성할 수 있습니다:
- [swift-openapi-generator](https://github.com/apple/swift-openapi-generator) (Apple 공식)
- 또는 수동으로 DTO 작성

---

## 인증 흐름

```
사용자                     앱                        백엔드
  │                        │                          │
  │  Apple Sign In 탭      │                          │
  │───────────────────────►│                          │
  │                        │                          │
  │  Apple id_token        │                          │
  │◄───────────────────────│                          │
  │                        │                          │
  │                        │  POST /auth/apple        │
  │                        │─────────────────────────►│
  │                        │                          │
  │                        │  access + refresh token  │
  │                        │◄─────────────────────────│
  │                        │                          │
  │                        │  Keychain에 토큰 저장     │
  │                        │                          │
```

- **access_token**: 1시간 만료 → Keychain 저장
- **refresh_token**: 30일 만료 → Keychain 저장
- **자동 갱신**: access 만료 시 APIClient가 자동으로 refresh 호출

---

## 네비게이션

**NavigationStack** 기반:

```swift
// 앱 전체 네비게이션
enum AppRoute: Hashable {
    case designDetail(id: UUID)
    case shopDetail(id: UUID)
    case reservation(designId: UUID)
    case reservationDetail(id: UUID)
    case snapDetail(id: UUID)
    case profile(userId: UUID)
    case settings
}
```

### 탭 구조 (예정)

| 탭 | 화면 | 설명 |
|---|---|---|
| 🏠 홈 | 디자인 피드 | 추천 + 인기 디자인 |
| 🔍 검색 | 검색 + 필터 | 태그, 색상, 분위기, 지역 |
| 🗺️ 지도 | 주변 샵 | MapKit 기반 |
| 🐌 스네일 | 커뮤니티 피드 | 게시글, 좋아요, 댓글 |
| 👤 마이 | 프로필 | 예약 내역, 즐겨찾기, 설정 |

---

## 상태 관리

### @Observable (iOS 17+)

```swift
@Observable
final class DesignSearchViewModel {
    var designs: [Design] = []
    var isLoading = false
    var searchQuery = ""
    
    private let searchDesignsUseCase: SearchDesignsUseCase
    
    func search() async {
        isLoading = true
        defer { isLoading = false }
        designs = try await searchDesignsUseCase.execute(query: searchQuery)
    }
}
```

### 전역 상태

- **AuthState**: 로그인 상태, 현재 유저 정보 → `@Observable` singleton
- **Feature State**: 각 ViewModel이 로컬 관리

---

## 이미지 로딩

- **AsyncImage** (기본) 또는 **Kingfisher/Nuke** (캐시 성능)
- 썸네일 → 원본 progressive loading
- GCS Signed URL은 만료 시간이 있으므로 캐시 정책 주의

---

## 주요 의존성 (예정)

| 패키지 | 용도 | 비고 |
|---|---|---|
| (내장) URLSession | 네트워킹 | async/await |
| (내장) MapKit | 지도 | iOS 17+ |
| (내장) AuthenticationServices | Apple Sign In | |
| Kingfisher 또는 Nuke | 이미지 캐시 | SPM |
| SwiftLint | 코드 스타일 | Build Phase |

> 외부 의존성은 최소화합니다. 가능하면 Apple 내장 프레임워크를 우선 사용합니다.

---

## 테스트 전략

| 레벨 | 대상 | 도구 |
|---|---|---|
| Unit | ViewModel, UseCase, Repository | XCTest |
| Snapshot | SwiftUI View | swift-snapshot-testing |
| UI | 핵심 시나리오 E2E | XCUITest |

### Mock / Stub

- Repository Protocol을 통해 Mock 주입
- `MockAPIClient`로 네트워크 의존성 제거

---

## 폴더 구조 규칙

```
Features/
├── Search/
│   ├── Views/
│   │   ├── DesignSearchView.swift
│   │   └── DesignFilterSheet.swift
│   ├── ViewModels/
│   │   └── DesignSearchViewModel.swift
│   └── Components/
│       └── DesignCard.swift
```

- **Feature별 폴더 분리**: 각 기능은 독립적으로 관리
- **Views/ViewModels/Components**: 일관된 하위 구조
- **공유 컴포넌트**: `Core/Components/`에 배치
