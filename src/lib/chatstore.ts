export interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
}

export interface ChatRoom {
  id: string;
  username: string;
  board: string;
  messages: ChatMessage[];
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
}

const CHAT_STORAGE_KEY = "chat_rooms";

export const getChatRooms = (): ChatRoom[] => {
  const stored = localStorage.getItem(CHAT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveChatRooms = (rooms: ChatRoom[]) => {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(rooms));
};

export const getOrCreateChatRoom = (username: string, board: string): ChatRoom => {
  const rooms = getChatRooms();
  const existing = rooms.find(r => r.username === username);
  
  if (existing) {
    return existing;
  }
  
  const newRoom: ChatRoom = {
    id: `chat_${username}_${Date.now()}`,
    username,
    board,
    messages: [],
    createdAt: new Date().toISOString(),
    unread: 0,
  };
  
  saveChatRooms([newRoom, ...rooms]);
  return newRoom;
};

export const addMessageToRoom = (username: string, message: ChatMessage): ChatRoom | null => {
  const rooms = getChatRooms();
  const roomIndex = rooms.findIndex(r => r.username === username);
  
  if (roomIndex === -1) return null;
  
  rooms[roomIndex].messages.push(message);
  rooms[roomIndex].lastMessage = message.text;
  rooms[roomIndex].lastMessageTime = message.time;
  
  saveChatRooms(rooms);
  return rooms[roomIndex];
};

export const getChatRoomByUsername = (username: string): ChatRoom | null => {
  const rooms = getChatRooms();
  return rooms.find(r => r.username === username) || null;
};