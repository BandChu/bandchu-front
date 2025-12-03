# js 브랜치 작업 문서

**작업일**: 2025-12-02  
**브랜치**: `js`

---

## 목차

- [변경된 파일](#변경된-파일)
- [연결된 API](#연결된-api)
- [주요 기능](#주요-기능)
- [향후 작업](#향후-작업)

---

## 변경된 파일

### 공통 관리 파일

> 프로젝트 전반에서 사용되는 설정, 라이브러리, 컴포넌트 파일들

#### 인프라/설정
- **`vite.config.ts`** - 빌드 도구 설정
  - API 프록시: `/api` → `https://bandchu.o-r.kr/api`
  - 개발 서버 포트: 8000
- **`src/index.css`** - 전역 스타일
  - Sonner 토스트 폰트 (Pretendard) 적용
  - Stereofidelic 폰트 정의 (`@font-face`)
  - Tailwind CSS 기본 스타일
  - 페이지 전환 애니메이션 (fadeIn/fadeOut)
  - 부드러운 스크롤 (`scroll-behavior: smooth`)
  - 전역 트랜지션 효과 (색상, 배경, 테두리 등)

#### 공통 라이브러리
- **`src/lib/api.ts`** - Axios HTTP 클라이언트
  - 요청 인터셉터: JWT 토큰 자동 추가 (인증 필요 엔드포인트만)
    - 인증 불필요 엔드포인트 예외 처리: `/api/members/login`, `/api/members/signup`, `/api/members/token/refresh`
  - 응답 인터셉터: 401 에러 시 자동 토큰 갱신
- **`src/lib/api/auth.ts`** - 인증 API 함수
  - `login()`, `signup()`, `logout()`, `deleteAccount()`
  - `setupProfile()`, `refreshToken()`
  - 회원가입 API 응답 구조 변경 (토큰 없음, 회원 정보만 반환)
- **`src/lib/api/subscription.ts`** - 구독 API 함수
  - `subscribeToArtist()` - 아티스트 구독하기 (API 연동 완료)
  - `unsubscribeFromArtist()` - 구독 취소하기 (API 연동 완료)
  - `getSubscriptions()` - 구독 목록 조회 (API 연동 완료)
- **`src/lib/utils.ts`** - 유틸리티 함수
  - `cn()` - 클래스명 병합 함수
  - `formatPerformingSchedule()` - 공연 일정 포맷팅 함수
  - `formatDateTime()` - 날짜/시간 포맷팅 함수

#### 공통 컴포넌트
- **`src/components/Header.tsx`** - 전역 헤더
  - 로그인 상태에 따른 BANDCHU 로고 동작 (`/home` 또는 `/auth`)
  - BANDCHU 로고에 Stereofidelic 폰트 적용
- **`src/components/BottomNav.tsx`** - 하단 네비게이션
  - Calendar 경로: `/` → `/home`
- **`src/components/ui/sonner.tsx`** - 토스트 알림
  - Pretendard 폰트 적용

#### 라우팅/앱 설정
- **`src/App.tsx`** - 앱 루트 및 라우팅
  - 로그인 상태 기반 루트 경로 리다이렉트
  - 전역 Provider 설정
  - 페이지 전환 시 자동 스크롤 맨 위로 이동
  - 페이지 전환 애니메이션 적용 (`AnimatedRoutes` 컴포넌트)

### 페이지 파일

#### 인증 관련
- **`src/pages/Auth.tsx`** - 로그인/회원가입 선택 (온보딩 페이지)
  - BANDCHU 로고에 Stereofidelic 폰트 적용
  - 슬로건: "인디 아티스트와 팬을 잇는 플랫폼"
  - 서브 슬로건: "팬의 발견, 아티스트의 도약"
  - 미니멀한 레이아웃 (아이콘 제거, 텍스트 중심)
  - 구글 로그인/회원가입 버튼 클릭 시 미구현 안내 토스트 표시
- **`src/pages/Login.tsx`** - 로그인 (이메일 저장)
  - 구글 로그인 버튼 클릭 시 미구현 안내 토스트 표시
- **`src/pages/SignupForm.tsx`** - 회원가입 폼
  - 회원가입 후 자동 로그인 호출하여 토큰 획득
  - 이메일, 역할 저장 후 프로필 설정 페이지로 이동
- **`src/pages/ProfileSetup.tsx`** - 프로필 설정 (닉네임, 프로필 이미지 저장)
- **`src/pages/AccountDelete.tsx`** - 회원탈퇴 (사용자 정보 정리)

#### 기능 페이지
- **`src/pages/My.tsx`** - 마이페이지
  - 사용자 정보 표시 및 로그아웃/회원탈퇴 기능
  - 로그아웃 시 확인 다이얼로그 추가 ("로그아웃 하시겠습니까?")
  - 로그아웃 로직 개선: 다이얼로그 먼저 닫기, API 호출 실패해도 로컬 정리 후 로그아웃 처리
- **`src/pages/Index.tsx`** - 홈 페이지
  - 아티스트 다중 선택 기능
  - 선택된 아티스트별 캘린더 일정 필터링
  - 날짜 선택 시 해당 날짜의 공연 일정 표시 (`EventList` 컴포넌트)
  - 구독한 아티스트 목록 자동 로드 및 업데이트
- **`src/pages/ArtistList.tsx`** - 나의 아티스트 추가 페이지
  - 아티스트 검색 기능
  - 구독하기/구독 취소 API 연동 완료
  - 로딩 상태 표시 및 에러 처리
  - API 실패 시 기본 아티스트 데이터로 폴백
- **`src/pages/ArtistDetail.tsx`** - 아티스트 상세 페이지
  - Toss 스타일 디자인 적용
  - 큰 프로필 이미지 헤더 (400px 높이)
  - 그라데이션 오버레이 및 어두운 배경 처리
  - 프로필 이미지 투명도 조정 (`opacity-70`, `bg-black/40` 오버레이)
  - 장르별 색상 구분 기능 (enum 기반: BALLAD, DANCE, RAP, HIPHOP, ROCK, METAL, POP, INDIE, JAZZ, JPOP)
  - 헤더와 Info 탭에서 장르별 다른 색상 적용 (밝은 배경용/어두운 헤더용)
  - 공연/앨범 탭으로 정보 분리 표시
  - 공연 카드 디자인 개선 (컴팩트한 레이아웃, 예매 버튼 인라인 배치)
  - 앨범 그리드 레이아웃 (3열)
  - SNS 링크 표시
  - API 실패 시 Mock 데이터로 폴백
- **`src/components/ArtistCarousel.tsx`** - 아티스트 캐러셀 컴포넌트
  - 캘린더 상단에 구독한 아티스트 표시
  - 아티스트 다중 선택 기능 (캘린더 일정 필터링용)
  - 선택된 아티스트 시각적 피드백 (테두리, 그림자, 색상)
  - 구독하기/구독 취소 API 연동 완료
  - 로딩 상태 표시 및 에러 처리
  - "펼쳐보기" 기능: 구독한 아티스트 목록 확장 표시
  - 펼쳐보기 시 "구독한 아티스트" 안내 문구 및 총 인원수 표시
  - 아티스트 클릭: 단일 클릭 시 캘린더 토글, 더블 클릭 시 상세 페이지 이동
  - 아티스트별 장르 색상 구분 표시
  - 아티스트별 간단한 설명 표시
  - 드래그 스크롤 기능: 아티스트를 드래그하여 좌우로 스크롤 가능 (마우스 및 터치 지원)
  - 드래그 중 클릭 이벤트 방지로 의도치 않은 동작 방지
- **`src/components/Calendar.tsx`** - 캘린더 컴포넌트
  - 아티스트 선택 없으면 일정 표시 안 함 (안내 문구 표시)
  - 선택된 아티스트별 색상 구분 일정 표시 
  - 날짜 칸에 작은 색상 바와 아티스트 이름 표시
  - 오늘 날짜 표시: 연한 배경색 + primary 색상 숫자
  - 선택된 아티스트 목록 표시 및 선택 해제 기능
  - 캘린더 그리드 배경 컨테이너 스타일 적용
  - 모든 달에 5주(35일)까지만 표시, 5주차 이후 다른 달 날짜는 흐리게 표시
  - 날짜 클릭 시 해당 날짜의 일정 표시 기능
  - 월/년도 네비게이션 버튼 개선 (화살표 버튼에 호버 시 안내 텍스트 표시)
  - 텍스트 가독성 개선 (아티스트 이름 크기 및 색상 대비 향상)

### 새로 생성된 파일

- **`src/lib/api/auth.ts`** - 인증 API 함수 모듈
- **`src/lib/api/subscription.ts`** - 구독 API 함수 모듈
- **`src/data/artistSchedules.ts`** - 아티스트 일정 데이터 (하드코딩)
  - 아티스트별 일정 날짜 및 색상 정의
  - 아티스트 일정 조회 유틸리티 함수
  - 전체 아티스트 목록 조회 함수 (`getAllArtists()`)
  - 특정 아티스트 정보 조회 함수 (`getArtistById()`)
- **`src/data/artistEvents.ts`** - 공연 및 앨범 Mock 데이터
  - 날짜별 공연 Mock 데이터 (12월 1일~31일)
  - 아티스트별 앨범 Mock 데이터
  - 선택된 날짜와 아티스트에 맞는 공연 이벤트 생성 함수 (`getEventsByDate()`)
  - 아티스트별 공연 목록 조회 함수 (`getConcertsByArtist()`)
  - 아티스트별 앨범 목록 조회 함수 (`getAlbumsByArtist()`)
  - 모든 공연에 예매 URL 포함 (예매하기 버튼 표시용)
- **`src/pages/Auth.tsx`** - 로그인/회원가입 선택 (온보딩 페이지)
- **`src/pages/SignupType.tsx`** - 회원가입 유형 선택
- **`src/pages/EmailVerification.tsx`** - 이메일 인증
- **`src/components/GoogleIcon.tsx`** - 구글 아이콘 컴포넌트
- **`src/components/EventList.tsx`** - 선택된 날짜의 공연 일정 목록 컴포넌트
  - 아티스트별로 그룹화하여 표시
  - 공연 카드 클릭 시 아티스트 상세 페이지로 이동
  - 공연 이미지 없을 시 Mic 아이콘 표시
- **`src/types/artist.ts`** - 아티스트 관련 타입 정의
  - `ArtistDetail`, `Artist`, `ArtistsApiResponse`, `SnsLink` 인터페이스
- **`src/types/album.ts`** - 앨범 관련 타입 정의
  - `Album` 인터페이스
- **`src/types/concert.ts`** - 공연 관련 타입 정의
  - `Concert`, `PerformingSchedule` 인터페이스
- **`src/types/calendarEvent.ts`** - 캘린더 이벤트 관련 타입 정의
  - `CalendarEvent` 인터페이스
- **`public/fonts/Stereofidelic.otf`** - BANDCHU 로고용 커스텀 폰트

---

## 연결된 API

### 인증 API

| Method | Endpoint | 설명 | 상태 |
|--------|----------|------|------|
| `POST` | `/api/members/login` | 로그인 | ✅ 연동 완료 |
| `POST` | `/api/members/signup` | 회원가입 | ✅ 연동 완료 |
| `POST` | `/api/members/logout` | 로그아웃 | ✅ 연동 완료 |
| `POST` | `/api/members/token/refresh` | 토큰 갱신 (자동) | ✅ 연동 완료 |
| `PATCH` | `/api/members/me/profile/setup` | 프로필 설정 | ✅ 연동 완료 |
| `DELETE` | `/api/members/me` | 회원탈퇴 | ✅ 연동 완료 |
| `POST` | `/api/members/oauth/google` | 구글 OAuth | ⏸️ 미구현 |

### 구독 API

| Method | Endpoint | 설명 | 상태 |
|--------|----------|------|------|
| `POST` | `/api/subscriptions` | 아티스트 구독하기 | ✅ 연동 완료 |
| `DELETE` | `/api/subscriptions/{artiProfileId}` | 구독 취소하기 | ✅ 연동 완료 |
| `GET` | `/api/subscriptions` | 구독 목록 조회 | ✅ 연동 완료 |

### 아티스트 API

| Method | Endpoint | 설명 | 상태 |
|--------|----------|------|------|
| `GET` | `/api/artists` | 아티스트 목록 조회 | ✅ 연동 완료 (API 실패 시 Mock 데이터로 폴백) |
| `GET` | `/api/artists/{artistId}` | 아티스트 상세 조회 | ✅ 연동 완료 (API 실패 시 Mock 데이터로 폴백) |

**참고**: 아티스트 API는 서버 API를 호출하며, 실패하거나 데이터가 없을 경우 Mock 데이터(`src/data/artistSchedules.ts`)로 폴백합니다.

### 공연/앨범 API

| Method | Endpoint | 설명 | 상태 |
|--------|----------|------|------|
| `GET` | `/api/concerts?artistId={artistId}` | 공연 목록 조회 | ⚠️ **API 실패 시 Mock 데이터로 폴백** |
| `GET` | `/api/albums?artistId={artistId}` | 앨범 목록 조회 | ⚠️ **API 실패 시 Mock 데이터로 폴백** |

**참고**: 공연/앨범 API는 먼저 서버 API를 호출하지만, 실패하거나 데이터가 없을 경우 Mock 데이터(`src/data/artistEvents.ts`)로 폴백합니다.

### API 설정

- **Base URL**: `https://bandchu.o-r.kr`
- **개발 환경**: Vite 프록시 (`/api` → `https://bandchu.o-r.kr/api`)
- **인증**: JWT 토큰 (Authorization 헤더)
- **토큰 갱신**: 401 에러 시 자동 갱신 후 재시도

---

## 주요 기능

### 인증 플로우

1. **회원가입**: 유형 선택 → 이메일/비밀번호 입력 → 회원가입 API 호출 → 자동 로그인 API 호출 (토큰 획득) → 프로필 설정 → 홈 이동
   - 회원가입 API 응답: 토큰 없음, 회원 정보만 반환 (`memberId`, `email`, `nickname`, `role`, `createdAt`)
   - 회원가입 성공 후 자동으로 로그인 API 호출하여 토큰 획득
2. **로그인**: 이메일/비밀번호 입력 → 홈 이동
3. **로그아웃**: 마이페이지 → 로그아웃 버튼 → 확인 다이얼로그 → API 호출 → 로그인 페이지
4. **회원탈퇴**: 마이페이지 → 회원탈퇴 버튼 → 확인 → API 호출 → 로그인 페이지

### 구글 로그인/회원가입

- **현재 상태**: 미구현
- **동작**: 구글 로그인/회원가입 버튼 클릭 시 "구글 로그인 기능은 현재 미구현입니다." 토스트 메시지 표시
- **적용 위치**: `Auth.tsx` (로그인/회원가입 선택), `Login.tsx` (로그인 페이지)

### 데이터 관리

- **토큰 관리**: localStorage 저장, 자동 갱신
- **사용자 정보**: localStorage에 이메일, 닉네임, 프로필 이미지, 역할 저장
- **아티스트 일정**: 하드코딩된 데이터 (`src/data/artistSchedules.ts`)
  - 10개 인디 아티스트의 12월 일정 데이터
  - 아티스트별 고유 색상 할당
  - 선택된 아티스트의 일정만 캘린더에 표시
- **구독 데이터**: API 연동 완료
  - `getSubscriptions()`: 서버 API에서 구독 목록 조회
  - `subscribeToArtist()`: 서버 API로 구독 추가
  - `unsubscribeFromArtist()`: 서버 API로 구독 제거
- **공연/앨범 데이터**: Mock 데이터 사용 (`src/data/artistEvents.ts`)
  - 날짜별 공연 정보
  - 아티스트별 앨범 정보
  - API 실패 시 Mock 데이터로 폴백

### 캘린더 기능

- **아티스트 선택**: 다중 선택 가능, 선택된 아티스트의 일정만 표시
- **일정 표시**: 구글 캘린더 스타일 - 날짜 칸에 작은 색상 바와 아티스트 이름 표시 (아티스트별 색상 구분)
- **오늘 날짜**: 연한 배경색 + primary 색상 숫자
- **선택 안내**: 아티스트 선택 없으면 안내 문구 표시
- **날짜 선택**: 날짜 클릭 시 해당 날짜의 공연 일정이 하단에 표시됨
- **월 표시 제한**: 모든 달에 5주(35일)까지만 표시, 5주차 이후 다른 달 날짜는 흐리게 표시
- **텍스트 가독성**: 아티스트 이름 크기 및 색상 대비 향상 (흰색 텍스트, 그림자 효과)
- **월 네비게이션**: 이전/다음 달 이동 버튼, 호버 시 안내 텍스트 표시

### 공연 및 앨범 Mock 데이터

- **공연 데이터**: 12월 1일~31일 모든 날짜에 공연 정보 포함
- **앨범 데이터**: 각 아티스트별 앨범 정보 포함
- **예매 URL**: 모든 공연에 예매 URL 포함 (예매하기 버튼 표시용)
- **기본 이미지**: 공연 포스터/앨범 커버 이미지 없을 시 Lucide 아이콘 표시
  - 공연: Mic 아이콘
  - 앨범: PlayCircle 아이콘

### 페이지 전환 애니메이션

- **fadeIn/fadeOut**: 페이지 전환 시 부드러운 페이드 효과
- **스크롤 처리**: 페이지 전환 시 자동으로 맨 위로 스크롤
- **전역 트랜지션**: 색상, 배경, 테두리 등에 부드러운 전환 효과 적용

### 아티스트 상세 페이지 디자인

- **헤더 섹션**: 큰 프로필 이미지 (400px 높이) + 그라데이션 오버레이
- **이미지 처리**: 프로필 이미지 투명도 조정 (`opacity-70`) 및 어두운 오버레이 (`bg-black/40`)로 텍스트 가독성 향상
- **장르 색상 구분**: enum 기반 장르별 고유 색상 적용
  - 일반 배경용: 밝은 색상 (예: `bg-blue-50 text-blue-700`)
  - 헤더 배경용: 반투명 색상 (예: `bg-blue-500/30 text-blue-100`)
  - 지원 장르: BALLAD, DANCE, RAP, HIPHOP, ROCK, METAL, POP, INDIE, JAZZ, JPOP (한국어 장르명도 지원)
- **탭 구조**: 공연/앨범/게시글/정보 탭으로 분리
- **공연 카드**: 컴팩트한 레이아웃, 예매 버튼 인라인 배치
- **앨범 그리드**: 3열 그리드 레이아웃

### 에러 처리

- **401**: 자동 토큰 갱신 또는 로그인 페이지 이동
- **409**: 이메일/닉네임 중복 에러 메시지 표시
- **네트워크 에러**: 연결 실패 알림
- **로그아웃**: API 호출 실패해도 로컬 정리 후 로그아웃 처리 (사용자 경험 개선)

### 기술 스택

- **프레임워크**: React 18, TypeScript, Vite
- **라우팅**: React Router DOM
- **폼 관리**: React Hook Form, Zod
- **HTTP**: Axios
- **UI**: Shadcn/ui, Tailwind CSS
- **알림**: Sonner
- **아이콘**: Lucide React
- **폰트**: Pretendard (기본), Stereofidelic (BANDCHU 로고)

---

## 향후 작업

### API 연동
- [x] 구독 API 실제 연동 (`/api/subscriptions`) ✅ 완료
  - `POST /api/subscriptions` - 아티스트 구독하기
  - `DELETE /api/subscriptions/{artiProfileId}` - 구독 취소하기
  - `GET /api/subscriptions` - 구독 목록 조회
- [x] 아티스트 API 실제 연동 (`/api/artists`) ✅ 완료
  - `GET /api/artists` - 아티스트 목록 조회
  - `GET /api/artists/{artistId}` - 아티스트 상세 조회
  - API 실패 시 Mock 데이터로 폴백 유지
- [ ] 공연/앨범 API 실제 연동
  - 현재 API 실패 시 Mock 데이터로 폴백
  - `GET /api/concerts?artistId={artistId}` - 공연 목록 조회
  - `GET /api/albums?artistId={artistId}` - 앨범 목록 조회

---

**참고**: [API 문서](https://bandchu.o-r.kr/v3/api-docs) | [API 서버](https://bandchu.o-r.kr)
