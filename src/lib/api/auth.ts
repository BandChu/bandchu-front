import apiClient from '../api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  role: 'FAN' | 'ARTIST';
}

export interface SignupResponse {
  memberId: number;
  email: string;
  nickname: string;
  role: 'FAN' | 'ARTIST';
  accessToken: string;
  refreshToken: string;
  createdAt: string;
}

export interface ProfileSetupRequest {
  nickname: string;
  profileImageUrl?: string;
}

export interface UpdateRoleRequest {
  role: 'FAN' | 'ARTIST';
}

export interface UpdateRoleResponse {
  memberId: number;
  role: 'FAN' | 'ARTIST';
}

export interface ProfileSetupResponse {
  nickname: string;
  profileImageUrl?: string;
}

export interface MemberInfoResponse {
  memberId: number;
  email: string;
  nickname: string;
  role: 'FAN' | 'ARTIST';
  profileImageUrl?: string;
}

export interface GoogleOAuthRequest {
  idToken: string;
}

export interface GoogleOAuthResponse {
  accessToken: string;
  refreshToken: string;
  isNewMember: boolean;
  isProfileCompleted?: boolean; // 프로필 설정 완료 여부
  memberId: number;
  nickname: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 로그인
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<{ data: LoginResponse }>('/api/members/login', data);
  return response.data.data;
};

// 회원가입
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await apiClient.post('/api/members/signup', data);
  
  // API 응답 구조: { success: true, data: { memberId, email, nickname, role, createdAt }, message: "string" }
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  throw new Error('회원가입 응답 구조가 올바르지 않습니다.');
};

// 프로필 설정
export const setupProfile = async (data: ProfileSetupRequest): Promise<ProfileSetupResponse> => {
  const response = await apiClient.patch('/api/members/me/profile/setup', data);
  
  // 응답 구조에 따라 처리 (data.data 또는 직접 data)
  if (response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// 구글 OAuth 로그인
export const googleOAuth = async (data: GoogleOAuthRequest): Promise<GoogleOAuthResponse> => {
  const response = await apiClient.post<{ data: GoogleOAuthResponse }>('/api/members/oauth/google', data);
  return response.data.data;
};

// 토큰 갱신
export const refreshToken = async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post('/api/members/token/refresh', data);
  
  // 응답 구조에 따라 처리
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/members/logout');
};

// 회원탈퇴
export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete('/api/members/me');
};

// 회원 role 업데이트 (구글 회원가입 시 사용)
export const updateMemberRole = async (data: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
  const response = await apiClient.patch<{ success: boolean; data: UpdateRoleResponse; message: string }>('/api/members/me/role', data);
  
  // API 응답 구조: { success: true, data: { memberId, role }, message: "string" }
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  throw new Error('역할 업데이트 응답 구조가 올바르지 않습니다.');
};

// 사용자 정보 조회
export const getMemberInfo = async (): Promise<MemberInfoResponse> => {
  const response = await apiClient.get<{ success: boolean; data: MemberInfoResponse; message: string }>('/api/members/me');
  
  // 백엔드 응답 구조: { success: true, data: { memberId, email, nickname, role, profileImageUrl }, message: "..." }
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  throw new Error('사용자 정보 조회 응답 구조가 올바르지 않습니다.');
};

// Google OAuth Client ID 조회 (공개 설정)
export const fetchGoogleClientId = async (): Promise<string> => {
  try {
    const response = await apiClient.get<{ data: { clientId: string } }>('/api/config/google-client-id');
    return response.data.data.clientId;
  } catch (error) {
    console.error('Google Client ID 조회 실패:', error);
    throw error;
  }
};

