import apiClient from '../api';
import {
    CreateChatRoomRequest,
    CreateChatRoomResponse,
    ChatRoomListResponse,
    SendMessageRequest,
    ChatMessage,
    MessagePageResponse,
    UpdateReadStatusRequest,
    UpdateReadStatusResponse,
    ChatRoomDetail,
} from '@/types/chat';

/**
 * 채팅방 생성
 * POST /api/chatrooms
 */
export const createChatRoom = async (request: CreateChatRoomRequest): Promise<CreateChatRoomResponse> => {
    const response = await apiClient.post<{ success: boolean; data: CreateChatRoomResponse }>('/api/chatrooms', request);
    return response.data.data;
};

/**
 * 채팅방 목록 조회
 * GET /api/chatrooms
 */
export const getChatRoomList = async (): Promise<ChatRoomListResponse> => {
    const response = await apiClient.get<{ success: boolean; data: ChatRoomListResponse }>('/api/chatrooms');
    return response.data.data;
};

/**
 * 메시지 전송
 * POST /api/chatrooms/{roomId}/messages
 */
export const sendMessage = async (roomId: number, request: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post<{ success: boolean; data: ChatMessage }>(
        `/api/chatrooms/${roomId}/messages`,
        request
    );
    return response.data.data;
};

/**
 * 메시지 목록 조회 (페이징)
 * GET /api/chatrooms/{roomId}/messages
 */
export const getMessages = async (
    roomId: number,
    cursor?: number | null,
    size: number = 30
): Promise<MessagePageResponse> => {
    const params = new URLSearchParams();
    if (cursor !== null && cursor !== undefined) {
        params.append('cursor', cursor.toString());
    }
    params.append('size', size.toString());

    const response = await apiClient.get<{ success: boolean; data: MessagePageResponse }>(
        `/api/chatrooms/${roomId}/messages?${params.toString()}`
    );
    return response.data.data;
};

/**
 * 메시지 읽음 처리
 * PATCH /api/chatrooms/{roomId}/read
 */
export const updateReadStatus = async (
    roomId: number,
    request: UpdateReadStatusRequest
): Promise<UpdateReadStatusResponse> => {
    const response = await apiClient.put<{ success: boolean; data: UpdateReadStatusResponse }>(
        `/api/chatrooms/${roomId}/read-status`,  // 수정!
        request
    );
    return response.data.data;
};

/**
 * 채팅방 숨기기
 * PUT /api/chatrooms/{roomId}/hide 또는 PATCH /api/chatrooms/{roomId}/hide
 */
export const hideChatRoom = async (roomId: number): Promise<void> => {
    try {
        // 숨기기 API 호출 (엔드포인트는 백엔드에 맞게 수정 필요)
        const response = await apiClient.put(`/api/chatrooms/${roomId}/hide`);
        
        // 응답이 없거나 성공인 경우
        if (response.status === 200 || response.status === 204) {
            return;
        }
        
        // 응답 구조 확인
        if (response.data && response.data.success === false) {
            throw new Error(response.data.message || '채팅방 숨기기에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('Hide chat room error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

export const getChatRoomDetail = async (roomId: number): Promise<ChatRoomDetail> => {
  const response = await apiClient.get<{ success: boolean; data: ChatRoomDetail }>(
    `/api/chatrooms/${roomId}`
  );
  return response.data.data;
};