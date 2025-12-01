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
  - `subscribeToArtist()` - 아티스트 구독하기
  - `unsubscribeFromArtist()` - 구독 취소하기
  - `getSubscriptions()` - 구독 목록 조회 (미구현 상태)

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
- **`src/pages/Index.tsx`** - 홈 페이지
  - 아티스트 다중 선택 기능
  - 선택된 아티스트별 캘린더 일정 필터링
- **`src/pages/ArtistList.tsx`** - 나의 아티스트 추가 페이지
  - 아티스트 검색 기능
  - 구독하기/구독 취소 API 연동
  - 로딩 상태 표시 및 에러 처리
- **`src/components/ArtistCarousel.tsx`** - 아티스트 캐러셀 컴포넌트
  - 캘린더 상단에 구독한 아티스트 표시
  - 아티스트 다중 선택 기능 (캘린더 일정 필터링용)
  - 선택된 아티스트 시각적 피드백 (테두리, 그림자, 색상)
  - 구독하기/구독 취소 API 연동
  - 로딩 상태 표시 및 에러 처리
- **`src/components/Calendar.tsx`** - 캘린더 컴포넌트
  - 아티스트 선택 없으면 일정 표시 안 함 (안내 문구 표시)
  - 선택된 아티스트별 색상 구분 일정 표시
  - 날짜 칸 전체 색칠 제거, 작은 색상 점으로 일정 표시
  - 오늘 날짜 표시: 연한 배경색 + "오늘" 텍스트 + primary 색상 숫자
  - 선택된 아티스트 목록 표시 및 선택 해제 기능
  - 캘린더 그리드 배경 컨테이너 스타일 적용

### 새로 생성된 파일

- **`src/lib/api/auth.ts`** - 인증 API 함수 모듈
- **`src/lib/api/subscription.ts`** - 구독 API 함수 모듈
- **`src/data/artistSchedules.ts`** - 아티스트 일정 데이터 (하드코딩)
  - 아티스트별 일정 날짜 및 색상 정의
  - 아티스트 일정 조회 유틸리티 함수
- **`src/pages/Auth.tsx`** - 로그인/회원가입 선택 (온보딩 페이지)
- **`src/pages/SignupType.tsx`** - 회원가입 유형 선택
- **`src/pages/EmailVerification.tsx`** - 이메일 인증
- **`src/components/GoogleIcon.tsx`** - 구글 아이콘 컴포넌트
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
| `POST` | `/api/subscriptions` | 아티스트 구독하기 | ⚠️ 연동 완료 (서버 다운타임 에러 해결 후 진행 예정) |
| `DELETE` | `/api/subscriptions/{artiProfileId}` | 구독 취소하기 | ⚠️ 연동 완료 (서버 다운타임 에러 해결 후 진행 예정) |
| `GET` | `/api/subscriptions` | 구독 목록 조회 | ⏸️ 미구현 |

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

### 캘린더 기능

- **아티스트 선택**: 다중 선택 가능, 선택된 아티스트의 일정만 표시
- **일정 표시**: 날짜 칸 하단에 작은 색상 점으로 표시 (아티스트별 색상 구분)
- **오늘 날짜**: 연한 배경색 + "오늘" 텍스트 + primary 색상 숫자
- **선택 안내**: 아티스트 선택 없으면 안내 문구 표시

### 에러 처리

- **401**: 자동 토큰 갱신 또는 로그인 페이지 이동
- **409**: 이메일/닉네임 중복 에러 메시지 표시
- **네트워크 에러**: 연결 실패 알림

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

- [ ] 구글 OAuth 로그인 구현

---

**참고**: [API 문서](https://bandchu.o-r.kr/v3/api-docs) | [API 서버](https://bandchu.o-r.kr)
