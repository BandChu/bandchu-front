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
  - Tailwind CSS 기본 스타일

#### 공통 라이브러리
- **`src/lib/api.ts`** - Axios HTTP 클라이언트
  - 요청 인터셉터: JWT 토큰 자동 추가 (인증 필요 엔드포인트만)
    - 인증 불필요 엔드포인트 예외 처리: `/api/members/login`, `/api/members/signup`, `/api/members/token/refresh`
  - 응답 인터셉터: 401 에러 시 자동 토큰 갱신
- **`src/lib/api/auth.ts`** - 인증 API 함수
  - `login()`, `signup()`, `logout()`, `deleteAccount()`
  - `setupProfile()`, `refreshToken()`

#### 공통 컴포넌트
- **`src/components/Header.tsx`** - 전역 헤더
  - 로그인 상태에 따른 BANDCHU 로고 동작 (`/home` 또는 `/auth`)
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
- **`src/pages/Auth.tsx`** - 로그인/회원가입 선택
  - 구글 로그인/회원가입 버튼 클릭 시 미구현 안내 토스트 표시
- **`src/pages/Login.tsx`** - 로그인 (이메일 저장)
  - 구글 로그인 버튼 클릭 시 미구현 안내 토스트 표시
- **`src/pages/SignupForm.tsx`** - 회원가입 폼 (이메일, 역할 저장)
- **`src/pages/ProfileSetup.tsx`** - 프로필 설정 (닉네임, 프로필 이미지 저장)
- **`src/pages/AccountDelete.tsx`** - 회원탈퇴 (사용자 정보 정리)

#### 기능 페이지
- **`src/pages/My.tsx`** - 마이페이지
  - 토스 UI 스타일 디자인
  - 사용자 정보 표시 및 로그아웃/회원탈퇴 기능

### 새로 생성된 파일

- **`src/lib/api/auth.ts`** - 인증 API 함수 모듈
- **`src/pages/Auth.tsx`** - 로그인/회원가입 선택
- **`src/pages/SignupType.tsx`** - 회원가입 유형 선택
- **`src/pages/EmailVerification.tsx`** - 이메일 인증
- **`src/components/GoogleIcon.tsx`** - 구글 아이콘 컴포넌트

---

## 연결된 API

### 인증 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/members/login` | 로그인 |
| `POST` | `/api/members/signup` | 회원가입 |
| `POST` | `/api/members/logout` | 로그아웃 |
| `POST` | `/api/members/token/refresh` | 토큰 갱신 (자동) |
| `PATCH` | `/api/members/me/profile/setup` | 프로필 설정 |
| `DELETE` | `/api/members/me` | 회원탈퇴 |
| `POST` | `/api/members/oauth/google` | 구글 OAuth (구현 예정) |

### API 설정

- **Base URL**: `https://bandchu.o-r.kr`
- **개발 환경**: Vite 프록시 (`/api` → `https://bandchu.o-r.kr/api`)
- **인증**: JWT 토큰 (Authorization 헤더)
- **토큰 갱신**: 401 에러 시 자동 갱신 후 재시도

---

## 주요 기능

### 인증 플로우

1. **회원가입**: 유형 선택 → 이메일/비밀번호 입력 → 프로필 설정 → 홈 이동
2. **로그인**: 이메일/비밀번호 입력 → 홈 이동
3. **로그아웃**: 마이페이지 → 로그아웃 버튼 → API 호출 → 로그인 페이지
4. **회원탈퇴**: 마이페이지 → 회원탈퇴 버튼 → 확인 → API 호출 → 로그인 페이지

### 구글 로그인/회원가입

- **현재 상태**: 미구현
- **동작**: 구글 로그인/회원가입 버튼 클릭 시 "구글 로그인 기능은 현재 미구현입니다." 토스트 메시지 표시
- **적용 위치**: `Auth.tsx` (로그인/회원가입 선택), `Login.tsx` (로그인 페이지)

### 데이터 관리

- **토큰 관리**: localStorage 저장, 자동 갱신
- **사용자 정보**: localStorage에 이메일, 닉네임, 프로필 이미지, 역할 저장

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

---

## 향후 작업

- [ ] 구글 OAuth 로그인 구현

---

**참고**: [API 문서](https://bandchu.o-r.kr/v3/api-docs) | [API 서버](https://bandchu.o-r.kr)
