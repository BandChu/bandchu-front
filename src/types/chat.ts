export enum RoomType {
    DIRECT = 'DIRECT',
    GROUP = 'GROUP'
}

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE'
}

export interface CreateChatRoomRequest {
    roomType: RoomType;
    name: string | null;
    memberIds: number[];
}

export interface CreateChatRoomResponse {
    roomId: number;
    roomType: RoomType;
    name: string | null;
    createdAt: string;
}

export interface ChatRoomSummary {
    roomId: number;
    roomType: RoomType;
    name: string | null;
    lastMessage: string | null;
    unreadCount: number;
    updatedAt: string | null;
}

export interface ChatRoomListResponse {
    rooms: ChatRoomSummary[];
}

export interface SendMessageRequest {
    messageType: MessageType;
    content: string | null;
    fileUrl: string | null;
}

export interface ChatMessage {
    messageId: number;
    roomId: number;
    senderId: number;
    messageType: MessageType;
    content: string | null;
    fileUrl: string | null;
    createdAt: string;
}

export interface MessagePageResponse {
    messages: ChatMessage[];
    nextCursor: number | null;
}

export interface UpdateReadStatusRequest {
    lastReadMessageId: number;
}

export interface UpdateReadStatusResponse {
    roomId: number;
    lastReadMessageId: number;
}

export interface ChatRoomDetail {
  roomId: number;
  roomType: 'DIRECT' | 'GROUP';
  name: string;
  members: ChatRoomMember[];
  createdAt: string;
}

export interface ChatRoomMember {
  userId: number;
  username: string;
  profileImage?: string;
  role?: string;
}