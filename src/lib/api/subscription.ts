import apiClient from '../api';

export interface SubscribeRequest {
  artiProfileId: number;
}

export interface SubscriptionResponse {
  subscriptionId: number;
  memberId: number;
  artiProfileId: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * 아티스트 구독하기
 */
export const subscribeToArtist = async (artiProfileId: number): Promise<SubscriptionResponse> => {
  try {
    // 인증 토큰 확인
    const token = localStorage.getItem('accessToken');
    console.log('현재 토큰 존재 여부:', !!token);
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    
    const response = await apiClient.post<any>('/api/subscriptions', {
      artiProfileId,
    });
    
    console.log('구독하기 API 응답:', response.data);
    
    // 응답 구조 확인: response.data.data 또는 response.data
    if (response.data) {
      // 표준 응답 구조: { success: true, data: {...}, message: "string" }
      if (response.data.data && response.data.data.subscriptionId) {
        return response.data.data;
      }
      // data가 직접 있는 경우 (응답 구조가 다를 수 있음)
      if (response.data.subscriptionId) {
        return response.data as SubscriptionResponse;
      }
    }
    
    console.error('구독하기 API 응답 구조 오류:', response.data);
    throw new Error('구독하기 실패: 응답 구조가 올바르지 않습니다.');
  } catch (error: any) {
    console.error('구독하기 API 에러:', error);
    console.error('에러 응답:', error.response?.data);
    console.error('에러 상태:', error.response?.status);
    console.error('요청 URL:', error.config?.url);
    console.error('요청 헤더:', error.config?.headers);
    
    // 403 에러인 경우 특별 처리
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || '권한이 없습니다. 로그인 상태를 확인해주세요.';
      throw new Error(errorMessage);
    }
    
    // 404 에러인 경우 특별 처리
    if (error.response?.status === 404) {
      const errorMessage = error.response?.data?.message || 'API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};

/**
 * 구독 목록 가져오기
 */
export const getSubscriptions = async (): Promise<SubscriptionResponse[]> => {
  const response = await apiClient.get<ApiResponse<SubscriptionResponse[]>>('/api/subscriptions');
  
  if (response.data && response.data.data) {
    return response.data.data;
  }
  
  return [];
};

/**
 * 구독 취소하기
 */
export const unsubscribeFromArtist = async (artiProfileId: number): Promise<void> => {
  await apiClient.delete(`/api/subscriptions/${artiProfileId}`);
};

