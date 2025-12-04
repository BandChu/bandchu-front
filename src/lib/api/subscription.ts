import apiClient from '../api';
import { SubscribedConcertsResponse } from '@/types/subscribedConcerts';


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

// Mock 데이터 폴백용
const MOCK_SUBSCRIPTIONS_KEY = 'mock_subscriptions';

const getMockSubscriptions = (): number[] => {
  const subscriptionsJson = localStorage.getItem(MOCK_SUBSCRIPTIONS_KEY);
  return subscriptionsJson ? JSON.parse(subscriptionsJson) : [];
};

const saveMockSubscriptions = (subscriptions: number[]) => {
  localStorage.setItem(MOCK_SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
};

/**
 * 구독한 아티스트의 공연/일정 전체 조회
 */ 
export const getSubscribedConcerts = async (): Promise<SubscribedConcertsResponse> => {
  try {
    const response = await apiClient.get<any>('/api/concerts/subscribed');
    
    // 응답 구조가 다를 수 있으므로 여러 경우를 처리
    if (response.data?.data?.artists) {
      // { data: { artists: [...] } } 구조
      return response.data.data as SubscribedConcertsResponse;
    } else if (response.data?.artists) {
      // { artists: [...] } 구조 (직접)
      return response.data as SubscribedConcertsResponse;
    } else if (response.data?.data) {
      // 다른 구조일 수 있음
      const data = response.data.data;
      if (data.artists) {
        return data as SubscribedConcertsResponse;
      }
    }
    
    throw new Error('응답 구조가 예상과 다릅니다.');
  } catch (error: any) {
    console.error("getSubscribedConcerts 에러:", error);
    throw error;
  }
};

/**
 * Mock 구독하기 (API 실패 시 폴백용)
 * API 실패 시에는 서버 상태를 알 수 없으므로, 사용자가 구독하기를 누르면 항상 구독 추가
 */
const subscribeToArtistMock = async (artiProfileId: number): Promise<SubscriptionResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        reject(new Error('로그인이 필요합니다.'));
        return;
      }

      // API 실패 시 Mock 폴백이므로, 서버 상태를 알 수 없어 항상 구독 허용
      // 사용자가 구독하기를 누르면 Mock 데이터에 추가
      const currentSubscriptions = getMockSubscriptions();
      if (!currentSubscriptions.includes(artiProfileId)) {
        const updatedSubscriptions = [...currentSubscriptions, artiProfileId];
        saveMockSubscriptions(updatedSubscriptions);
      }

      resolve({
        subscriptionId: Date.now(),
        memberId: 1,
        artiProfileId,
        createdAt: new Date().toISOString(),
      });
    }, 300);
  });
};

/**
 * Mock 구독 목록 가져오기
 */
const getSubscriptionsMock = async (): Promise<SubscriptionResponse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subscriptionIds = getMockSubscriptions();
      const subscriptions: SubscriptionResponse[] = subscriptionIds.map((id, index) => ({
        subscriptionId: index + 1,
        memberId: 1,
        artiProfileId: id,
        createdAt: new Date().toISOString(),
      }));
      resolve(subscriptions);
    }, 200);
  });
};

/**
 * Mock 구독 취소하기
 */
const unsubscribeFromArtistMock = async (artiProfileId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        reject(new Error('로그인이 필요합니다.'));
        return;
      }

      const currentSubscriptions = getMockSubscriptions();
      const updatedSubscriptions = currentSubscriptions.filter(id => id !== artiProfileId);
      saveMockSubscriptions(updatedSubscriptions);
      resolve();
    }, 300);
  });
};

/**
 * 아티스트 구독하기 (API 호출, 실패 시 Mock 폴백)
 */
export const subscribeToArtist = async (artiProfileId: number): Promise<SubscriptionResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<SubscriptionResponse>>('/api/subscriptions', {
      artiProfileId,
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || '구독하기에 실패했습니다.');
  } catch (error: any) {
    console.warn('구독 API 호출 실패, Mock 데이터로 폴백:', error.message);
    // API 실패 시 Mock으로 폴백
    return subscribeToArtistMock(artiProfileId);
  }
};

/**
 * 구독 목록 가져오기 (API 호출, 실패 시 Mock 폴백)
 */
export const getSubscriptions = async (): Promise<SubscriptionResponse[]> => {
  try {
    const response = await apiClient.get<ApiResponse<SubscriptionResponse[]>>('/api/subscriptions');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || '구독 목록을 불러오는데 실패했습니다.');
  } catch (error: any) {
    console.warn('구독 목록 API 호출 실패, Mock 데이터로 폴백:', error.message);
    // API 실패 시 Mock으로 폴백
    return getSubscriptionsMock();
  }
};

/**
 * 구독 취소하기 (API 호출, 실패 시 Mock 폴백)
 */
export const unsubscribeFromArtist = async (artiProfileId: number): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/subscriptions/${artiProfileId}`);
    
    if (response.data.success) {
      return;
    }
    
    throw new Error(response.data.message || '구독 취소에 실패했습니다.');
  } catch (error: any) {
    console.warn('구독 취소 API 호출 실패, Mock 데이터로 폴백:', error.message);
    // API 실패 시 Mock으로 폴백
    return unsubscribeFromArtistMock(artiProfileId);
  }
};

