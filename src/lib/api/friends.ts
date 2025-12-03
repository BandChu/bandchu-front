const API_BASE_URL = "https://bandchu.o-r.kr";

// 인증 헤더 생성
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export type FriendStatus = 'PENDING' | 'ACCEPTED';

export interface FriendResponse {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendStatus;
  createdAt: string;
  isSentByMe: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 친구 요청 목록 조회 (보낸 요청 + 받은 요청)
export const getFriendRequests = async (): Promise<FriendResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/friends/requests`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("친구 요청 목록을 불러오는데 실패했습니다.");
  }

  const result: ApiResponse<FriendResponse[]> = await response.json();
  return result.data;
};

// 친구 요청 보내기
export const sendFriendRequest = async (receiverId: number): Promise<FriendResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/friends/requests?receiverId=${receiverId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "친구 요청을 보내는데 실패했습니다.");
  }

  const result: ApiResponse<FriendResponse> = await response.json();
  return result.data;
};

// 친구 요청 수락
export const acceptFriendRequest = async (requestId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/friends/requests/${requestId}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("친구 요청 수락에 실패했습니다.");
  }
};

// 친구 요청 거절
export const rejectFriendRequest = async (requestId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/friends/requests/${requestId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("친구 요청 거절에 실패했습니다.");
  }
};

// 친구 목록 조회 (수락된 친구만)
export const getFriends = async (): Promise<FriendResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/friends`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("친구 목록을 불러오는데 실패했습니다.");
  }

  const result: ApiResponse<FriendResponse[]> = await response.json();
  return result.data;
};